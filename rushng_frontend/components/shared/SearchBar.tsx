'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className,
  debounceMs = 300,
  autoFocus = false,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(value || '');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    onChange?.(val);

    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      onSearch?.(val);
    }, debounceMs);
    setDebounceTimer(timer);
  };

  const handleClear = () => {
    setSearchValue('');
    onChange?.('');
    onSearch?.('');
    if (debounceTimer) clearTimeout(debounceTimer);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimer) clearTimeout(debounceTimer);
    onSearch?.(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative flex items-center', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-9 pr-10"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <Button type="submit" variant="ghost" className="ml-2">
        Search
      </Button>
    </form>
  );
}