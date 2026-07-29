'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle2,
  Edit2,
  Save,
  X,
  Camera,
  Briefcase,
  Star,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { userApi } from '@/lib/api';

interface ProfileFormData {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileStats, setProfileStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    rating: 0,
    verificationLevel: 'basic' as 'basic' | 'verified' | 'certified'
  });
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
      });
      fetchProfileStats();
    }
  }, [user, loading, isAuthenticated, router]);

  const fetchProfileStats = async () => {
    try {
      const response = await userApi.getProfileStats();
      if (response.data?.success) {
        setProfileStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile stats:', error);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await userApi.updateProfile(formData);
      if (response.data?.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
    });
    setIsEditing(false);
  };

  const getVerificationBadge = (level: string) => {
    const badges = {
      basic: { label: 'Basic', color: 'bg-gray-500' },
      verified: { label: 'Verified', color: 'bg-blue-500' },
      certified: { label: 'Certified', color: 'bg-emerald-500' }
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  const verificationBadge = getVerificationBadge(profileStats.verificationLevel);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="gradient-rush text-white"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-orange-200 shadow-lg">
                    <AvatarImage src={user?.profile_picture || ''} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Badge variant="orange" className="text-xs capitalize">
                  {user?.role || 'User'}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{user?.is_verified ? 'Verified Account' : 'Not Verified'}</span>
                </div>
                {user?.role === 'provider' && (
                  <Badge className={`${verificationBadge.color} text-white`}>
                    {verificationBadge.label}
                  </Badge>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="h-10"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user?.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user?.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-10"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user?.phone || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Member Since</Label>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    {isEditing ? (
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your address"
                        className="h-10"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user?.address || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">City</Label>
                    {isEditing ? (
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Enter your city"
                        className="h-10"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user?.city || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">State</Label>
                    {isEditing ? (
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Enter your state"
                        className="h-10"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user?.state || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gradient-rush text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileStats.totalJobs || 0}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileStats.rating || 0}★</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileStats.completedJobs || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider-specific Info */}
        {user?.role === 'provider' && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-500" />
                Provider Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Verification Level</span>
                  <Badge className={`${verificationBadge.color} text-white capitalize`}>
                    {verificationBadge.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Years Experience</span>
                  <span className="text-sm font-medium">N/A</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Service Radius</span>
                  <span className="text-sm font-medium">N/A</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Compliance Score</span>
                  <span className="text-sm font-medium">N/A</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}