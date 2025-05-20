// src/utils/socket.ts

let socket: WebSocket | null = null;
let isConnected = false;
let messageQueue: any[] = [];
let reconnectAttempts = 0;
const MAX_RETRIES = 5;
const ACK_TIMEOUT = 5000;

const ackTrack: Record<string, {
  message: any;
  retries: number;
  timeout?: NodeJS.Timeout;
}> = {};

// WebSocket connection with retry logic
export const connectChatSocket = (sessionId: string, senderId: string) => {
  if (socket && isConnected) return;

  socket = new WebSocket(`wss://photoaid.onrender.com/chat/ws/${sessionId}/${senderId}`);
  //socket = new WebSocket(`ws://192.168.0.159:8000/chat/ws/${sessionId}/${senderId}`);
  
  socket.onopen = () => {
    console.log('✅ WebSocket connected');
    isConnected = true;
    reconnectAttempts = 0;

    // Send queued messages
    while (messageQueue.length > 0) {
      const msg = messageQueue.shift();
      socket?.send(JSON.stringify(msg));
    }
  };

  socket.onclose = (e) => {
    console.log('❌ WebSocket disconnected', e.reason);
    isConnected = false;

    // Reconnect with exponential backoff
    if (reconnectAttempts < MAX_RETRIES) {
      setTimeout(() => connectChatSocket(sessionId, senderId), 2000 * ++reconnectAttempts);
    }
  };

  socket.onerror = (e) => {
    console.error('❗ WebSocket error', e.message);
    isConnected = false;
  };
};

// Send message with ACK logic and retry
export const sendMessage = (message: any) => {
  const messageId = message.message_id || Math.random().toString(36).substr(2, 9);
  const payload = {
    ...message,
    message_id: messageId,
    type: 'chat',
  };

  const retrySend = () => {
    if (!ackTrack[messageId]) return;

    if (ackTrack[messageId].retries >= MAX_RETRIES) {
      console.warn(`🚫 Message ${messageId} failed after max retries.`);
      clearTimeout(ackTrack[messageId].timeout);
      delete ackTrack[messageId];
      return;
    }

    ackTrack[messageId].retries += 1;
    console.log(`🔁 Retrying message ${messageId}, attempt ${ackTrack[messageId].retries}`);
    sendPayload();
  };

  const sendPayload = () => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      ackTrack[messageId] = {
        message: payload,
        retries: ackTrack[messageId]?.retries || 0,
        timeout: setTimeout(retrySend, ACK_TIMEOUT),
      };
    } else {
      console.warn('⚠️ Socket not ready, queuing message.');
      messageQueue.push(payload);
    }
  };

  sendPayload();
  return messageId; // Return ID for tracking in UI
};

// Receive message from WebSocket
export const receiveMessage = (onMessage: (data: any) => void) => {
  if (!socket) return;

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // ACK handling
    if (data.type === 'ack' && data.message_id && ackTrack[data.message_id]) {
      clearTimeout(ackTrack[data.message_id].timeout);
      delete ackTrack[data.message_id];
      return; // Don't propagate ack to UI
    }

    // If a chat message is received, reply with ACK
    if (data.type === 'chat' && data.message_id) {
      const ackPayload = {
        type: 'ack',
        message_id: data.message_id,
        status: 'delivered',
      };
      socket?.send(JSON.stringify(ackPayload));
    }

    onMessage(data);
  };

  return () => {
    if (socket) socket.onmessage = null;
  };
};

// Disconnect WebSocket
export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    isConnected = false;
  }
};
