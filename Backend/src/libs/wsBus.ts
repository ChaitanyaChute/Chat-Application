import { EventEmitter } from 'events';

// Singleton event bus for WebSocket broadcasts
export const wsBus = new EventEmitter();
wsBus.setMaxListeners(0);
