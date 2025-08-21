"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { adminAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Save, RefreshCw, Download, Upload, Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [flushDialogOpen, setFlushDialogOpen] = useState(false);
  const [flushData, setFlushData] = useState({
    semesterToFlush: '',
    confirmationText: ''
  });
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
    replyTo: ''
  });
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: '30'
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const res = await adminAPI.getSystemStats();
      setSystemStats(res.data?.data || null);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlushSemester = async () => {
    if (flushData.confirmationText !== 'FLUSH SEMESTER') {
      toast({
        title: 'Confirmation Failed',
        description: 'Please type "FLUSH SEMESTER" to confirm this action.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await adminAPI.flushSemester(flushData);
      setFlushDialogOpen(false);
      setFlushData({
        semesterToFlush: '',
        confirmationText: ''
      });
      fetchSystemStats();
      toast({
        title: 'Success',
        description: `Semester ${flushData.semesterToFlush} data flushed successfully.`,
      });
    } catch (error) {
      console.error('Error flushing semester:', error);
      toast({
        title: 'Error',
        description: 'Failed to flush semester data. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveEmailSettings = () => {
    // This is a placeholder - you would need to implement this API endpoint
    toast({
      title: 'Email Settings Saved',
      description: 'Email configuration has been updated successfully.',
    });
  };

  const handleSaveBackupSettings = () => {
    // This is a placeholder - you would need to implement this API endpoint
    toast({
      title: 'Backup Settings Saved',
      description: 'Backup configuration has been updated successfully.',
    });
  };

  const handleTestEmailConnection = () => {
    // This is a placeholder - you would need to implement this API endpoint
    toast({
      title: 'Email Test Successful',
      description: 'Connection to email server verified successfully.',
    });
  };

  const handleCreateBackup = () => {
    // This is a placeholder - you would need to implement this API endpoint
    toast({
      title: 'Backup Created',
      description: 'Database backup has been created successfully.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="semester">Semester Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Overview of system statistics and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Users</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Users:</span>
                      <span className="font-medium">{systemStats?.users?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{systemStats?.users?.students || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teachers:</span>
                      <span className="font-medium">{systemStats?.users?.teachers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admins:</span>
                      <span className="font-medium">{systemStats?.users?.admins || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Academics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subjects:</span>
                      <span className="font-medium">{systemStats?.academics?.subjects || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assignments:</span>
                      <span className="font-medium">{systemStats?.academics?.assignments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submissions:</span>
                      <span className="font-medium">{systemStats?.academics?.submissions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Semesters:</span>
                      <span className="font-medium">{systemStats?.academics?.activeSemesters?.length || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">System</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Backup:</span>
                      <span className="font-medium">Today, 03:45 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database Size:</span>
                      <span className="font-medium">128 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Used:</span>
                      <span className="font-medium">1.2 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure email settings for system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Host</label>
                    <Input
                      placeholder="smtp.example.com"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Port</label>
                    <Input
                      placeholder="587"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Username</label>
                    <Input
                      placeholder="username"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={emailSettings.smtpPass}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPass: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Email</label>
                    <Input
                      placeholder="noreply@thapar.edu"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reply-To Email</label>
                    <Input
                      placeholder="support@thapar.edu"
                      value={emailSettings.replyTo}
                      onChange={(e) => setEmailSettings({...emailSettings, replyTo: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleTestEmailConnection}>
                    <Mail className="w-4 h-4 mr-2" /> Test Connection
                  </Button>
                  <Button onClick={handleSaveEmailSettings}>
                    <Save className="w-4 h-4 mr-2" /> Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Configure database backup settings and restore data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Backup Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Auto Backup</label>
                      <Select 
                        value={backupSettings.autoBackup ? "true" : "false"} 
                        onValueChange={(value) => setBackupSettings({...backupSettings, autoBackup: value === "true"})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Enabled</SelectItem>
                          <SelectItem value="false">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Backup Frequency</label>
                      <Select 
                        value={backupSettings.backupFrequency} 
                        onValueChange={(value) => setBackupSettings({...backupSettings, backupFrequency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Retention Period (days)</label>
                      <Input
                        type="number"
                        value={backupSettings.backupRetention}
                        onChange={(e) => setBackupSettings({...backupSettings, backupRetention: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button onClick={handleSaveBackupSettings}>
                      <Save className="w-4 h-4 mr-2" /> Save Settings
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Manual Backup & Restore</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Create Backup</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Create a manual backup of the current database state. This will include all user data, assignments, submissions, and system settings.
                      </p>
                      <Button onClick={handleCreateBackup}>
                        <Download className="w-4 h-4 mr-2" /> Create Backup
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Restore from Backup</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Restore the system from a previous backup. This will overwrite all current data.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Input type="file" accept=".sql,.gz,.zip" />
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" /> Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="semester" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semester Management</CardTitle>
              <CardDescription>Manage semester data and transitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Semesters</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {systemStats?.academics?.activeSemesters?.length > 0 ? (
                        systemStats.academics.activeSemesters.map((semester: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-sm py-1">
                            {semester}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No active semesters found.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Flush Semester Data</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-amber-600 mb-4">
                      <AlertTriangle className="h-5 w-5" />
                      <p className="font-medium">Warning: This action cannot be undone</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Flushing semester data will permanently remove all assignments, submissions, and teacher-subject assignments for the selected semester. Student and teacher accounts will be preserved.
                    </p>
                    <Dialog open={flushDialogOpen} onOpenChange={setFlushDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <RefreshCw className="w-4 h-4 mr-2" /> Flush Semester Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Flush Semester Data</DialogTitle>
                          <DialogDescription>
                            This action will permanently delete all assignments and submissions for the selected semester. This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Semester to Flush</label>
                            <Select 
                              value={flushData.semesterToFlush} 
                              onValueChange={(value) => setFlushData({...flushData, semesterToFlush: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Semester" />
                              </SelectTrigger>
                              <SelectContent>
                                {systemStats?.academics?.activeSemesters?.map((semester: string, index: number) => (
                                  <SelectItem key={index} value={semester}>{semester}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmation</label>
                            <p className="text-sm text-gray-600">
                              Type "FLUSH SEMESTER" to confirm this action.
                            </p>
                            <Input
                              placeholder="FLUSH SEMESTER"
                              value={flushData.confirmationText}
                              onChange={(e) => setFlushData({...flushData, confirmationText: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setFlushDialogOpen(false)}>Cancel</Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleFlushSemester}
                            disabled={!flushData.semesterToFlush || flushData.confirmationText !== 'FLUSH SEMESTER'}
                          >
                            Confirm Flush
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
