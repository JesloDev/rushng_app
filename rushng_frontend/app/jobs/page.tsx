'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { Search, MapPin, Calendar, DollarSign, Filter, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { toast } from 'sonner';

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
  'plumbing', 'electrical', 'carpentry', 'painting', 
  'tiling', 'masonry', 'welding', 'cleaning', 'laundry',
  'shopping', 'errands', 'repair', 'maintenance', 'installation'
];

export default function JobsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: initialCategory,
    city: '',
    state: '',
    status: 'posted',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Omit category filter if set to "all"
      const apiFilters = {
        ...filters,
        category: filters.category === 'all' ? '' : filters.category,
      };

      const response = await jobApi.list(apiFilters);
      if (response.data?.success) {
        setJobs(response.data.data.jobs || []);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Client-side instant search filtering
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
      posted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      assigned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const safeFormatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : 'Recently';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Available Jobs</h1>
          <p className="text-muted-foreground">Find local service jobs near you</p>
        </div>
        <Link href="/jobs/post">
          <Button className="gradient-rush text-white">Post a Job</Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-card rounded-lg p-4 shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or location..."
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
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
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

          <Button variant="outline" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Job Listings Stream */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl bg-card">
          <p className="text-lg font-medium text-muted-foreground mb-2">No jobs match your criteria</p>
          <p className="text-sm text-muted-foreground mb-4">Try clearing filters or check back later.</p>
          <Link href="/jobs/post">
            <Button variant="outline" className="text-orange-500 hover:text-orange-600">
              Post a Job
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Link href={`/jobs/${job.id}`} key={job.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span>{job.city || job.address || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>
                            {job.estimated_price
                              ? `₦${job.estimated_price.toLocaleString()}`
                              : 'Negotiable'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{safeFormatDate(job.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between items-end md:items-end border-t md:border-t-0 pt-3 md:pt-0">
                      <Badge variant="outline" className="capitalize">
                        {job.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        By {job.customer?.full_name || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}