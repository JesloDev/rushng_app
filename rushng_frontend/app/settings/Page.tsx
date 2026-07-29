'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Settings as SettingsIcon,
  Bell,
  Moon,
  Globe,
  Shield,
  Key,
  User,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { userApi } from '@/lib/api';

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface Preferences {
  notifications: boolean;
  darkMode: boolean;
  emailUpdates: boolean;
  twoFactor: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [preferences, setPreferences] = useState<Preferences>({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    twoFactor: false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    lastLogin: '',
    devices: 0,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchSecuritySettings();
    }
  }, [loading, isAuthenticated, router, user]);

  const fetchSecuritySettings = async () => {
    try {
      const response = await userApi.getSecuritySettings();
      if (response.data?.success) {
        const data = response.data.data;
        setSecuritySettings({
          twoFactorEnabled: data.twoFactorEnabled || false,
          lastLogin: data.lastLogin || '',
          devices: data.devices || 0,
        });
        setPreferences({
          ...preferences,
          twoFactor: data.twoFactorEnabled || false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      if (response.data?.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        toast.error(response.data?.message || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof Preferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
    
    try {
      await userApi.updatePreferences({ [key]: value });
      toast.success('Preferences updated!');
      
      if (key === 'twoFactor') {
        setSecuritySettings({
          ...securitySettings,
          twoFactorEnabled: value,
        });
      }
    } catch (error) {
      toast.error('Failed to update preferences');
      // Revert on error
      setPreferences({ ...preferences, [key]: !value });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-orange-500" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences and security</p>
        </div>

        {/* Account Settings */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-500" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Badge variant="success">
                {user?.is_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-xs text-muted-foreground">{user?.phone || 'Not set'}</p>
                </div>
              </div>
              <Badge variant={user?.phone ? 'success' : 'secondary'}>
                {user?.phone ? 'Verified' : 'Not set'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
              <Badge variant={user?.is_active ? 'success' : 'destructive'}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {user?.role === 'provider' && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Verification Level</p>
                    <p className="text-xs text-muted-foreground capitalize">N/A</p>
                  </div>
                </div>
                <Badge variant="secondary">Basic</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security - Change Password */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      current_password: e.target.value
                    })}
                    required
                    className="h-10 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      new_password: e.target.value
                    })}
                    required
                    className="h-10 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirm_password: e.target.value
                    })}
                    required
                    className="h-10 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="gradient-rush text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.twoFactor}
                onCheckedChange={(checked) => handlePreferenceChange('twoFactor', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-xs text-muted-foreground">
                    {securitySettings.lastLogin || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Active Devices</p>
                  <p className="text-xs text-muted-foreground">
                    {securitySettings.devices || 0} devices
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive job notifications</p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Updates</p>
                  <p className="text-xs text-muted-foreground">Receive promotional emails</p>
                </div>
              </div>
              <Switch
                checked={preferences.emailUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('emailUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Handle account deletion
                    toast.error('Account deletion is not available yet');
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}