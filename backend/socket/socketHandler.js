const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store connected users
const connectedUsers = new Map();

/**
 * Initialize Socket.io handlers
 */
const initializeSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Store connected user
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      userId: socket.user._id,
      name: socket.user.name,
      role: socket.user.role
    });

    // Update user online status
    User.findByIdAndUpdate(socket.user._id, { isOnline: true }).exec();

    // Broadcast online users to all clients
    io.emit('users:online', Array.from(connectedUsers.values()));

    /**
     * Join a conversation room
     */
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.user.name} joined conversation ${conversationId}`);
    });

    /**
     * Leave a conversation room
     */
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.user.name} left conversation ${conversationId}`);
    });

    /**
     * Typing indicator
     */
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId: socket.user._id,
        userName: socket.user.name,
        conversationId
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId: socket.user._id,
        conversationId
      });
    });

    /**
     * New message event (broadcast to conversation participants)
     */
    socket.on('message:new', ({ conversationId, message }) => {
      io.to(`conversation:${conversationId}`).emit('message:received', {
        conversationId,
        message
      });
    });

    /**
     * Message read event
     */
    socket.on('message:read', ({ conversationId, messageIds }) => {
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        messageIds,
        readBy: socket.user._id
      });
    });

    /**
     * AI response started event
     */
    socket.on('ai:responding', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('ai:typing', {
        conversationId
      });
    });

    /**
     * Report created event (notify agents/admins)
     */
    socket.on('report:created', (report) => {
      // Broadcast to all agents and admins
      connectedUsers.forEach((connectedUser) => {
        if (connectedUser.role === 'agent' || connectedUser.role === 'admin') {
          io.to(connectedUser.socketId).emit('report:new', report);
        }
      });
    });

    /**
     * Report updated event
     */
    socket.on('report:updated', (report) => {
      // Broadcast to all agents and admins
      connectedUsers.forEach((connectedUser) => {
        if (connectedUser.role === 'agent' || connectedUser.role === 'admin') {
          io.to(connectedUser.socketId).emit('report:update', report);
        }
      });
    });

    /**
     * Agent assigned to conversation
     */
    socket.on('conversation:agent_assigned', ({ conversationId, agentId, conversation }) => {
      // Notify the user in the conversation
      io.to(`conversation:${conversationId}`).emit('conversation:agent_joined', {
        conversationId,
        agentId,
        conversation
      });
    });

    /**
     * Disconnect event
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);

      // Remove from connected users
      connectedUsers.delete(socket.user._id.toString());

      // Update user online status and last seen
      User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: Date.now()
      }).exec();

      // Broadcast updated online users list
      io.emit('users:online', Array.from(connectedUsers.values()));
    });
  });

  return io;
};

module.exports = { initializeSocket, connectedUsers };
