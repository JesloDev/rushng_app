'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jobApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Filter, 
  RefreshCw,
  Grid,
  List,
  TrendingUp,
  Clock,
  Star,
  Users as UsersIcon,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLoadingStore } from '@/store/loading-store';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  status: string;
  estimated_price?: number;
  created_at: string;
  customer?: {
    full_name?: string;
  };
}

const CATEGORIES = [
  'all',
  'plumbing', 'electrical', 'carpentry', 'painting', 
  'tiling', 'masonry', 'welding', 'cleaning', 'laundry',
  'shopping', 'errands', 'repair', 'maintenance', 'installation'
];

export default function JobsPage() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState({
    category: 'all',
    city: '',
    state: '',
    status: 'posted',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    startLoading('Loading jobs...');
    
    try {
      const apiFilters = {
        ...filters,
        category: filters.category === 'all' ? '' : filters.category,
      };
      
      const response = await jobApi.list(apiFilters);
      
      if (response.data?.success) {
        setJobs(response.data.data.jobs || []);
      } else {
        toast.error('Failed to load jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [filters, startLoading, stopLoading]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term) ||
        job.address?.toLowerCase().includes(term) ||
        job.city?.toLowerCase().includes(term) ||
        job.customer?.full_name?.toLowerCase().includes(term)
    );
  }, [jobs, searchTerm]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      posted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
      assigned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30',
      in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/30',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const safeFormatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : 'Recently';
  };

  const handleRefresh = () => {
    fetchJobs();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Available Jobs</h1>
          <p className="text-muted-foreground mt-1">Find trusted service jobs near you</p>
        </div>
        <Button 
          onClick={() => router.push('/jobs/post')}
          variant="gradient" 
          size="lg" 
          className="shadow-brand"
        >
          Post a Job
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredJobs.length}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'posted').length}</p>
              <p className="text-xs text-muted-foreground">New</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Star className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'completed').length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <UsersIcon className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'assigned').length}</p>
              <p className="text-xs text-muted-foreground">Assigned</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="bg-card rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.category}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && "bg-muted")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && "bg-muted")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl bg-card">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
            <Search className="h-10 w-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No jobs match your criteria</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Try clearing your filters or check back later for new opportunities.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilters({ category: 'all', city: '', state: '', status: 'posted' });
              }}
            >
              Clear Filters
            </Button>
            <Button 
              onClick={() => router.push('/jobs/post')}
              variant="gradient"
            >
              Post a Job
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredJobs.map((job) => (
            <Card 
              key={job.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30"
              onClick={() => router.push(`/jobs/${job.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold line-clamp-1">{job.title}</h3>
                    <Badge variant="outline" className={cn("border", getStatusColor(job.status))}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {job.description}
                  </p>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="truncate">{job.city || job.address || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600 shrink-0" />
                      <span>
                        {job.estimated_price
                          ? `₦${job.estimated_price.toLocaleString()}`
                          : 'Negotiable'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{safeFormatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <Badge variant="outline" className="capitalize text-xs">
                      {job.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      By {job.customer?.full_name || 'Anonymous'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}