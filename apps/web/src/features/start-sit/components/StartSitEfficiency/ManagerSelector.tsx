import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ManagerOption } from './utils';

interface ManagerSelectorProps {
  options: ManagerOption[];
  value: string;
  onChange: (managerId: string) => void;
  placeholder?: string;
}

export const ManagerSelector = memo(
  ({ options, value, onChange, placeholder = 'Select manager' }: ManagerSelectorProps) => {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label} ({option.leagueLabel})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
);

ManagerSelector.displayName = 'ManagerSelector';
