import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { INITIATIVE_STATUS_CONFIG, INITIATIVE_PRIORITY_CONFIG } from "@/hooks/useStrategicInitiatives";

interface InitiativeFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
}

export function InitiativeFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}: InitiativeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search initiatives..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {Object.entries(INITIATIVE_STATUS_CONFIG).map(([status, config]) => (
            <SelectItem key={status} value={status}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {Object.entries(INITIATIVE_PRIORITY_CONFIG).map(([priority, config]) => (
            <SelectItem key={priority} value={priority}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
