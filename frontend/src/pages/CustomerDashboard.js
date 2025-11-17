import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Paper,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Report as ReportIcon,
  Add as AddIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { conversationAPI, messageAPI, reportAPI } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const CustomerDashboard = () => {
  const { user, logout, updatePreferences } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [aiTyping, setAiTyping] = useState(false);

  // Dialogs
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Settings
  const [preferences, setPreferences] = useState({
    tone: user?.chatPreferences?.tone || 'formal',
    responseLength: user?.chatPreferences?.responseLength || 'detailed',
    customInstructions: user?.chatPreferences?.customInstructions || '',
  });

  // Report
  const [reportData, setReportData] = useState({
    issueType: 'other',
    description: '',
    priority: 'medium',
  });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTyping]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (selectedConversation) {
      socketService.joinConversation(selectedConversation._id);

      socketService.onMessageReceived((data) => {
        if (data.conversationId === selectedConversation._id) {
          setMessages((prev) => [...prev, data.message]);
          setAiTyping(false);
        }
      });

      socketService.onTypingUser((data) => {
        if (data.conversationId === selectedConversation._id) {
          setTypingUser(data.userName);
        }
      });

      socketService.onTypingStop((data) => {
        if (data.conversationId === selectedConversation._id) {
          setTypingUser(null);
        }
      });

      socketService.onAITyping((data) => {
        if (data.conversationId === selectedConversation._id) {
          setAiTyping(true);
        }
      });

      return () => {
        socketService.leaveConversation(selectedConversation._id);
        socketService.off('message:received');
        socketService.off('typing:user');
        socketService.off('typing:stop');
        socketService.off('ai:typing');
      };
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const response = await conversationAPI.getAll();
      setConversations(response.data.data);

      // Select first conversation if none selected
      if (!selectedConversation && response.data.data.length > 0) {
        selectConversation(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoading(true);

    try {
      const response = await messageAPI.getMessages(conversation._id);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }

    setLoading(false);
  };

  const createNewConversation = async () => {
    try {
      const response = await conversationAPI.create({
        title: `Conversation ${conversations.length + 1}`,
      });

      const newConversation = response.data.data;
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const handleTyping = () => {
    if (selectedConversation) {
      socketService.startTyping(selectedConversation._id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(selectedConversation._id);
      }, 1000);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedConversation) return;

    setSending(true);
    const messageText = messageInput.trim();
    setMessageInput('');

    // Stop typing indicator
    socketService.stopTyping(selectedConversation._id);

    try {
      // Indicate AI is responding
      socketService.aiResponding(selectedConversation._id);
      setAiTyping(true);

      const response = await messageAPI.sendMessage(selectedConversation._id, {
        content: messageText,
      });

      const { userMessage, aiMessage } = response.data.data;

      // Add user message
      setMessages((prev) => [...prev, userMessage]);

      // Emit message to socket
      socketService.sendMessage(selectedConversation._id, userMessage);

      // Add AI message if available
      if (aiMessage) {
        setTimeout(() => {
          setMessages((prev) => [...prev, aiMessage]);
          socketService.sendMessage(selectedConversation._id, aiMessage);
          setAiTyping(false);
        }, 500);
      } else {
        setAiTyping(false);
      }

      // Refresh conversations list
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      setAiTyping(false);
    }

    setSending(false);
  };

  const handleSavePreferences = async () => {
    const result = await updatePreferences(preferences);
    if (result.success) {
      setSettingsOpen(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedConversation || !reportData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    try {
      await reportAPI.create({
        conversation: selectedConversation._id,
        ...reportData,
      });

      socketService.createReport({
        conversation: selectedConversation._id,
        ...reportData,
      });

      toast.success('Report submitted successfully');
      setReportOpen(false);
      setReportData({
        issueType: 'other',
        description: '',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar - Conversations */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Conversations
          </Typography>
        </Toolbar>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewConversation}
          >
            New Chat
          </Button>
        </Box>
        <List>
          {conversations.map((conv) => (
            <ListItem
              button
              key={conv._id}
              selected={selectedConversation?._id === conv._id}
              onClick={() => selectConversation(conv)}
            >
              <ListItemText
                primary={conv.title}
                secondary={
                  conv.metadata.lastMessageAt
                    ? formatDistanceToNow(new Date(conv.metadata.lastMessageAt), {
                        addSuffix: true,
                      })
                    : 'No messages'
                }
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* AppBar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {selectedConversation?.title || 'AI Support Chat'}
            </Typography>
            <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Messages Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 3,
            bgcolor: '#f5f5f5',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Start a conversation with our AI support assistant
              </Typography>
            </Box>
          ) : (
            messages.map((message, index) => (
              <Box
                key={message._id || index}
                sx={{
                  display: 'flex',
                  justifyContent:
                    message.senderType === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                {message.senderType !== 'user' && (
                  <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                    <BotIcon />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor:
                      message.senderType === 'user' ? 'primary.main' : 'white',
                    color: message.senderType === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Paper>
                {message.senderType === 'user' && (
                  <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
                    <PersonIcon />
                  </Avatar>
                )}
              </Box>
            ))
          )}

          {/* Typing Indicator */}
          {(typingUser || aiTyping) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                <BotIcon />
              </Avatar>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {aiTyping ? 'AI is typing...' : `${typingUser} is typing...`}
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Paper
          component="form"
          onSubmit={sendMessage}
          sx={{
            p: 2,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton
            color="secondary"
            onClick={() => setReportOpen(true)}
            disabled={!selectedConversation}
          >
            <ReportIcon />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            disabled={!selectedConversation || sending}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!messageInput.trim() || !selectedConversation || sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </Paper>
      </Box>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chat Preferences</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tone</InputLabel>
              <Select
                value={preferences.tone}
                onChange={(e) => setPreferences({ ...preferences, tone: e.target.value })}
              >
                <MenuItem value="formal">Formal</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Response Length</InputLabel>
              <Select
                value={preferences.responseLength}
                onChange={(e) =>
                  setPreferences({ ...preferences, responseLength: e.target.value })
                }
              >
                <MenuItem value="detailed">Detailed</MenuItem>
                <MenuItem value="concise">Concise</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Custom Instructions"
              multiline
              rows={4}
              value={preferences.customInstructions}
              onChange={(e) =>
                setPreferences({ ...preferences, customInstructions: e.target.value })
              }
              helperText="Optional: Add specific instructions for the AI (max 500 characters)"
              inputProps={{ maxLength: 500 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePreferences} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report an Issue</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Issue Type</InputLabel>
              <Select
                value={reportData.issueType}
                onChange={(e) => setReportData({ ...reportData, issueType: e.target.value })}
              >
                <MenuItem value="inappropriate_response">Inappropriate Response</MenuItem>
                <MenuItem value="incorrect_information">Incorrect Information</MenuItem>
                <MenuItem value="technical_issue">Technical Issue</MenuItem>
                <MenuItem value="need_human_agent">Need Human Agent</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={reportData.priority}
                onChange={(e) => setReportData({ ...reportData, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Description"
              multiline
              rows={4}
              required
              value={reportData.description}
              onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
              helperText="Please describe the issue in detail"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReport} variant="contained" color="secondary">
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDashboard;
