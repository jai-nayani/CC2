import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, userAPI, faqAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [faqs, setFAQs] = useState([]);

  // User Management
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });

  // FAQ Management
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqFormData, setFaqFormData] = useState({
    category: 'general',
    question: '',
    answer: '',
    keywords: '',
  });

  useEffect(() => {
    loadData();
  }, [tabValue]);

  const loadData = async () => {
    try {
      switch (tabValue) {
        case 0: // Analytics
          const analyticsRes = await analyticsAPI.getDashboard();
          setAnalytics(analyticsRes.data.data);
          break;
        case 1: // Users
          const usersRes = await userAPI.getAll();
          setUsers(usersRes.data.data);
          break;
        case 2: // FAQs
          const faqsRes = await faqAPI.getAll();
          setFAQs(faqsRes.data.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  // User Management Functions
  const handleCreateUser = async () => {
    try {
      await userAPI.create(userFormData);
      toast.success('User created successfully');
      setUserDialogOpen(false);
      setUserFormData({ name: '', email: '', password: '', role: 'customer' });
      loadData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      await userAPI.update(editingUser._id, {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
      });
      toast.success('User updated successfully');
      setUserDialogOpen(false);
      setEditingUser(null);
      setUserFormData({ name: '', email: '', password: '', role: 'customer' });
      loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userAPI.delete(userId);
      toast.success('User deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // FAQ Management Functions
  const handleCreateFaq = async () => {
    try {
      const data = {
        ...faqFormData,
        keywords: faqFormData.keywords.split(',').map((k) => k.trim()),
      };
      await faqAPI.create(data);
      toast.success('FAQ created successfully');
      setFaqDialogOpen(false);
      setFaqFormData({ category: 'general', question: '', answer: '', keywords: '' });
      loadData();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error('Failed to create FAQ');
    }
  };

  const handleUpdateFaq = async () => {
    try {
      const data = {
        ...faqFormData,
        keywords: faqFormData.keywords.split(',').map((k) => k.trim()),
      };
      await faqAPI.update(editingFaq._id, data);
      toast.success('FAQ updated successfully');
      setFaqDialogOpen(false);
      setEditingFaq(null);
      setFaqFormData({ category: 'general', question: '', answer: '', keywords: '' });
      loadData();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await faqAPI.delete(faqId);
      toast.success('FAQ deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setUserDialogOpen(true);
  };

  const openEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords.join(', '),
    });
    setFaqDialogOpen(true);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={loadData}>
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Analytics" />
          <Tab label="User Management" />
          <Tab label="FAQ Management" />
        </Tabs>

        {/* Analytics Tab */}
        {tabValue === 0 && analytics && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">{analytics.users.total}</Typography>
                  <Typography variant="body2">
                    Online: {analytics.users.online}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Conversations
                  </Typography>
                  <Typography variant="h4">{analytics.conversations.total}</Typography>
                  <Typography variant="body2">
                    Active: {analytics.conversations.active}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Messages
                  </Typography>
                  <Typography variant="h4">{analytics.messages.total}</Typography>
                  <Typography variant="body2">
                    AI: {analytics.messages.ai}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Reports
                  </Typography>
                  <Typography variant="h4">{analytics.reports.pending}</Typography>
                  <Typography variant="body2">
                    Total: {analytics.reports.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* User Management Tab */}
        {tabValue === 1 && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Users</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingUser(null);
                  setUserFormData({ name: '', email: '', password: '', role: 'customer' });
                  setUserDialogOpen(true);
                }}
              >
                Add User
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isOnline ? 'Online' : 'Offline'}
                          size="small"
                          color={user.isOnline ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openEditUser(user)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* FAQ Management Tab */}
        {tabValue === 2 && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">FAQs</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingFaq(null);
                  setFaqFormData({ category: 'general', question: '', answer: '', keywords: '' });
                  setFaqDialogOpen(true);
                }}
              >
                Add FAQ
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Question</TableCell>
                    <TableCell>Answer</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq._id}>
                      <TableCell>
                        <Chip label={faq.category} size="small" />
                      </TableCell>
                      <TableCell>{faq.question}</TableCell>
                      <TableCell>
                        {faq.answer.substring(0, 100)}
                        {faq.answer.length > 100 ? '...' : ''}
                      </TableCell>
                      <TableCell>{faq.usageCount}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openEditFaq(faq)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteFaq(faq._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={userFormData.name}
            onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={userFormData.email}
            onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
          />
          {!editingUser && (
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={userFormData.role}
              onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="agent">Agent</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editingUser ? handleUpdateUser : handleCreateUser}
            variant="contained"
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={faqDialogOpen} onClose={() => setFaqDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={faqFormData.category}
              onChange={(e) => setFaqFormData({ ...faqFormData, category: e.target.value })}
            >
              <MenuItem value="account">Account</MenuItem>
              <MenuItem value="billing">Billing</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Question"
            value={faqFormData.question}
            onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Answer"
            multiline
            rows={4}
            value={faqFormData.answer}
            onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Keywords (comma-separated)"
            value={faqFormData.keywords}
            onChange={(e) => setFaqFormData({ ...faqFormData, keywords: e.target.value })}
            helperText="e.g., password, reset, login"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFaqDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editingFaq ? handleUpdateFaq : handleCreateFaq}
            variant="contained"
          >
            {editingFaq ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
