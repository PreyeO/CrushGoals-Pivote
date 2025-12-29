import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { useState } from "react";

type StatusFilter = 'all' | 'on-track' | 'ahead' | 'behind' | 'paused' | 'completed';
type CategoryFilter = 'all' | 'health' | 'finance' | 'career' | 'learning' | 'relationships' | 'personal' | 'fitness' | 'mindfulness' | 'content' | 'habits' | 'custom';

interface GoalFiltersSheetProps {
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  onStatusChange: (status: StatusFilter) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  filteredCount: number;
  totalCount: number;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'health', label: '🍎 Health' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'career', label: '💼 Career' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'relationships', label: '❤️ Relationships' },
  { value: 'mindfulness', label: '🧘 Mindfulness' },
  { value: 'content', label: '📱 Content' },
  { value: 'habits', label: '✨ Habits' },
  { value: 'personal', label: '🎯 Personal' },
  { value: 'custom', label: '⚡ Custom' },
];

export function GoalFiltersSheet({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
  filteredCount,
  totalCount,
}: GoalFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const hasFilters = statusFilter !== 'all' || categoryFilter !== 'all';
  const filterCount = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  const handleClear = () => {
    onStatusChange('all');
    onCategoryChange('all');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant={hasFilters ? "default" : "outline"} 
          size="sm" 
          className="gap-2 w-full"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
              {filterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Goals</SheetTitle>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground gap-1 text-xs"
              >
                <X className="w-3 h-3" />
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="ahead">Crushing It</SelectItem>
                <SelectItem value="behind">Behind</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryFilter} onValueChange={(v) => onCategoryChange(v as CategoryFilter)}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-center text-sm text-muted-foreground pt-2">
            Showing {filteredCount} of {totalCount} goals
          </div>

          {/* Apply button */}
          <Button 
            variant="hero" 
            className="w-full" 
            onClick={() => setOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
