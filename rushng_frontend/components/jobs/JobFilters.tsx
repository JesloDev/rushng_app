'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface JobFiltersProps {
  onFilterChange: (filters: any) => void;
  categories?: string[];
}

export function JobFilters({ onFilterChange, categories = [] }: JobFiltersProps) {
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  });

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'posted', label: 'Posted' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="pl-10"
        />
      </div>
      <Select
        value={filters.category}
        onValueChange={(value) => handleChange('category', value)}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(value) => handleChange('status', value)}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => {
        setFilters({ category: '', status: '', search: '' });
        onFilterChange({ category: '', status: '', search: '' });
      }}>
        <Filter className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}