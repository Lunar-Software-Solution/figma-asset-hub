import { InitiativeCard } from "./InitiativeCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { StrategicInitiative } from "@/hooks/useStrategicInitiatives";

interface InitiativeListProps {
  initiatives: StrategicInitiative[];
  isLoading: boolean;
  onSelect: (initiative: StrategicInitiative) => void;
  onEdit: (initiative: StrategicInitiative) => void;
  onDelete: (initiative: StrategicInitiative) => void;
}

export function InitiativeList({ initiatives, isLoading, onSelect, onEdit, onDelete }: InitiativeListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (initiatives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No initiatives found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first strategic initiative to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {initiatives.map((initiative) => (
        <InitiativeCard
          key={initiative.id}
          initiative={initiative}
          onClick={() => onSelect(initiative)}
          onEdit={() => onEdit(initiative)}
          onDelete={() => onDelete(initiative)}
        />
      ))}
    </div>
  );
}
