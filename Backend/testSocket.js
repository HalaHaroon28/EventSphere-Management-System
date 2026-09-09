// server/testSocket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
const socket = io(SOCKET_URL);

console.log('Connecting to Socket.io server...');

socket.on('connect', () => {
  console.log(`✅ Connected with Socket ID: ${socket.id}`);

  // Join a sample user room
  const sampleUserId = '66d48000a812bc34109e1111';
  socket.emit('join_user_room', sampleUserId);
});

// Listen for real-time events
socket.on('booth_status_changed', (data) => {
  console.log('📢 Event Received: booth_status_changed ->', data);
});

socket.on('session_created', (data) => {
  console.log('📢 Event Received: session_created ->', data);
});

socket.on('session_updated', (data) => {
  console.log('📢 Event Received: session_updated ->', data);
});

socket.on('new_notification', (data) => {
  console.log('📢 Event Received: new_notification ->', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket server.');
});