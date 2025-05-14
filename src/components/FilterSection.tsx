
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  filters: {
    name: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
}

const FilterSection: React.FC<FilterSectionProps> = ({ filters }) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <Filter size={16} className="text-dashboard-purple mr-2" />
        <h3 className="font-medium text-sm">Filtres</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.name}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {filter.name}
            </label>
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${filter.name}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="outline" size="sm" className="mr-2">Reset</Button>
        <Button size="sm" className="bg-dashboard-purple hover:bg-dashboard-blue transition-colors">Apply Filters</Button>
      </div>
    </div>
  );
};

export default FilterSection;
