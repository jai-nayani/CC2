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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Logout as LogoutIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { reportAPI, conversationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, conversationsRes] = await Promise.all([
        reportAPI.getAll(),
        conversationAPI.getAll(),
      ]);

      setReports(reportsRes.data.data);
      setConversations(conversationsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const handleAssignReport = async (reportId) => {
    try {
      await reportAPI.update(reportId, {
        assignedTo: user._id,
        status: 'in_review',
      });
      toast.success('Report assigned to you');
      loadData();
    } catch (error) {
      console.error('Error assigning report:', error);
      toast.error('Failed to assign report');
    }
  };

  const handleResolveReport = async () => {
    if (!selectedReport || !resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    try {
      await reportAPI.update(selectedReport._id, {
        status: 'resolved',
        notes: resolutionNotes,
      });
      toast.success('Report resolved successfully');
      setResolveDialogOpen(false);
      setSelectedReport(null);
      setResolutionNotes('');
      loadData();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to resolve report');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'in_review':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Agent Dashboard - {user?.name}
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
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending Reports
                </Typography>
                <Typography variant="h4">
                  {reports.filter((r) => r.status === 'pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  My Assigned Reports
                </Typography>
                <Typography variant="h4">
                  {reports.filter((r) => r.assignedTo?._id === user._id).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Conversations
                </Typography>
                <Typography variant="h4">
                  {conversations.filter((c) => c.status === 'active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Reports Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Reports
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Issue Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reported By</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell>{report.issueType.replace('_', ' ')}</TableCell>
                        <TableCell>
                          {report.description.substring(0, 50)}
                          {report.description.length > 50 ? '...' : ''}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.priority}
                            color={getPriorityColor(report.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            color={getStatusColor(report.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{report.reportedBy?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          {report.status === 'pending' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAssignReport(report._id)}
                            >
                              Assign to Me
                            </Button>
                          )}
                          {report.assignedTo?._id === user._id &&
                            report.status !== 'resolved' && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setResolveDialogOpen(true);
                                }}
                              >
                                Resolve
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {reports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No reports found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Resolve Report Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resolve Report</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Issue Type: {selectedReport.issueType.replace('_', ' ')}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedReport.description}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Resolution Notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the issue was resolved..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResolveReport} variant="contained">
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentDashboard;
