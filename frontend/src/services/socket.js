import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Conversation events
  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('conversation:join', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('conversation:leave', conversationId);
    }
  }

  // Typing events
  startTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  // Message events
  sendMessage(conversationId, message) {
    if (this.socket) {
      this.socket.emit('message:new', { conversationId, message });
    }
  }

  markMessageAsRead(conversationId, messageIds) {
    if (this.socket) {
      this.socket.emit('message:read', { conversationId, messageIds });
    }
  }

  // AI events
  aiResponding(conversationId) {
    if (this.socket) {
      this.socket.emit('ai:responding', { conversationId });
    }
  }

  // Report events
  createReport(report) {
    if (this.socket) {
      this.socket.emit('report:created', report);
    }
  }

  updateReport(report) {
    if (this.socket) {
      this.socket.emit('report:updated', report);
    }
  }

  // Event listeners
  onUsersOnline(callback) {
    if (this.socket) {
      this.socket.on('users:online', callback);
    }
  }

  onTypingUser(callback) {
    if (this.socket) {
      this.socket.on('typing:user', callback);
    }
  }

  onTypingStop(callback) {
    if (this.socket) {
      this.socket.on('typing:stop', callback);
    }
  }

  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('message:received', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message:read', callback);
    }
  }

  onAITyping(callback) {
    if (this.socket) {
      this.socket.on('ai:typing', callback);
    }
  }

  onNewReport(callback) {
    if (this.socket) {
      this.socket.on('report:new', callback);
    }
  }

  onReportUpdate(callback) {
    if (this.socket) {
      this.socket.on('report:update', callback);
    }
  }

  onConversationAgentJoined(callback) {
    if (this.socket) {
      this.socket.on('conversation:agent_joined', callback);
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();
export default socketService;
