// Fully fixed SessionChatScreen.tsx with correct ACK, delivery, and read logic + timestamp parsing fix

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSessionContext } from '../contexts/SessionContext';
import { getMessages } from '../services/chatService';
import {
  connectChatSocket,
  sendMessage as sendSocketMessage,
  receiveMessage,
  disconnectSocket,
} from '../utils/socket';
import { Ionicons } from '@expo/vector-icons';

const SessionChatScreen = ({ route }: any) => {
  const { sessionId } = route.params;
  const { user } = useAuth();
  const { sessions } = useSessionContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const pendingMessages = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!user?.id || !sessionId) return;

    connectChatSocket(sessionId, user.id);
    loadMessages();

    const unsubscribe = receiveMessage((msg: any) => {
      const type = msg.type;

      if (type === 'ack') {
        setMessages(prev => prev.map(m => m.message_id === msg.message_id
          ? { ...m, status: msg.status, timestamp: parseTimestamp(msg.timestamp) }
          : m));
        delete pendingMessages.current[msg.message_id];
      } else if (type === 'status') {
        setMessages(prev => prev.map(m => m.message_id === msg.message_id
          ? { ...m, status: msg.status }
          : m));
      } else if (type === 'chat') {
        const parsedType = msg.message_type ? JSON.parse(msg.message_type) : {};
        const normalizedMsg = {
          ...msg,
          message_id: msg.message_id || parsedType.message_id || Math.random().toString(36).substr(2, 9),
          timestamp: parseTimestamp(msg.timestamp || parsedType.timestamp),
          status: parsedType.status || 'sent',
        };

        if (normalizedMsg.sender_id === user?.id && pendingMessages.current[normalizedMsg.message_id]) {
          return;
        }

        setMessages(prev => {
          if (prev.find(m => m.message_id === normalizedMsg.message_id)) return prev;
          return [...prev, normalizedMsg];
        });

        if (normalizedMsg.sender_id !== user?.id) {
          sendSocketMessage({
            type: 'delivered',
            message_id: normalizedMsg.message_id,
          });
        }
      }
    });

    const interval = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => {
      disconnectSocket();
      unsubscribe?.();
      clearInterval(interval);
    };
  }, [sessionId, user?.id]);

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.sender_id !== user?.id && msg.status === 'delivered') {
        sendSocketMessage({
          type: 'read',
          message_id: msg.message_id,
        });
      }
    });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await getMessages(sessionId);
      setMessages(prev => {
        const seen = new Set(prev.map(m => m.message_id));
        const merged = [...prev];
        for (let msg of res) {
          if (!seen.has(msg.message_id)) {
            merged.push(msg);
          }
        }
        return merged.map(m => {
          const backendMsg = res.find(r => r.message_id === m.message_id);
          const convertedTimestamp = backendMsg ? parseTimestamp(backendMsg.timestamp) : m.timestamp;
          return backendMsg ? { ...m, timestamp: convertedTimestamp, status: backendMsg.status || m.status } : m;
        });
      });
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const parseTimestamp = (raw: string) => {
    if (!raw) return new Date();
    const iso = raw.includes('Z') ? raw : raw.split('.')[0] + 'Z';
    const date = new Date(iso);
    //console.log('Timestamp Raw:', raw, '| Parsed:', date, '| Valid:', !isNaN(date.getTime()));
    return date;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const tempId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    pendingMessages.current[tempId] = true;

    sendSocketMessage({
      type: 'chat',
      content: input,
      message_type: JSON.stringify({ message_id: tempId, timestamp, status: 'sending' }),
    });

    setInput('');
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
        {isMe && (
          <Text style={styles.statusText}>
            {item.status === 'sending'
              ? 'Sending...'
              : item.status === 'delivered'
              ? '✓ Delivered'
              : item.status === 'read'
              ? '✓✓ Read'
              : '✓ Sent'}
          </Text>
        )}
      </View>
    );
  };

  const session = sessions.find(s => s.session_id === sessionId);
  const otherProfile = session?.requester_id === user?.id ? session?.helper_profile : session?.requester_profile;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={24} color="#000" style={{ marginRight: 10 }} />
        <Text style={styles.headerText}>{otherProfile?.name || 'Chat'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.message_id?.toString() || index.toString()}
        renderItem={renderMessage}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SessionChatScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff' },
  headerText: { fontSize: 18, fontWeight: 'bold' },
  messageList: { flex: 1, paddingHorizontal: 10 },
  messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%' },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#d1e7dd' },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#e2e3e5' },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: '#555', marginTop: 4, textAlign: 'right' },
  statusText: { fontSize: 10, color: '#777', textAlign: 'right', marginTop: 2 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15 },
  sendButton: { marginLeft: 10, backgroundColor: '#6e5be0', borderRadius: 20, padding: 10 },
});