// Broadcast helpers using a process-wide event bus to avoid importing the chat server
// This prevents accidental re-initialization of the WebSocket server and port conflicts
import { wsBus } from './wsBus.js';

export const broadcastActivity = async (activity: any) => {
  try {
    wsBus.emit('activity', activity);
  } catch (error) {
    console.error('Error broadcasting activity:', error);
  }
};

export const broadcastNewMessage = async (messageData: any) => {
  try {
    wsBus.emit('new_message', messageData);
  } catch (error) {
    console.error('Error broadcasting message:', error);
  }
};
