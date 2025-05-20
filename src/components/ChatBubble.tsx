import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatBubbleProps {
  message: string;
  isSender: boolean;
}

const ChatBubble = ({ message, isSender }: ChatBubbleProps) => {
  return (
    <View style={[styles.bubble, isSender ? styles.sender : styles.receiver]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

export default ChatBubble;

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '70%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
  },
  sender: {
    alignSelf: 'flex-end',
    backgroundColor: '#4e8cff',
  },
  receiver: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  message: {
    color: '#fff',
  },
});
