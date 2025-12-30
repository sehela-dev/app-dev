"use client";

import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterSection {
  title: string;
  options: FilterOption[];
}

interface DropdownFilterProps {
  sections: FilterSection[];
  selectedValues: Record<string, string>;
  onSelectionChange: (sectionTitle: string, optionId: string) => void;
  onReset: () => void;
  triggerLabel?: string;
}

export function DropdownFilter({ sections, selectedValues, onSelectionChange, onReset }: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
          <ListFilter /> Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 h-96 flex flex-col p-0">
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="px-2 py-2">
            {sections.map((section, sectionIndex) => (
              <div key={section.title}>
                {sectionIndex > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">{section.title}</DropdownMenuLabel>
                <div className="px-2 py-2">
                  <RadioGroup value={selectedValues[section.title] || ""} onValueChange={(value) => onSelectionChange(section.title, value)}>
                    {section.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="text-sm font-medium text-brand-999 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DropdownMenuSeparator className="m-0" />
        <div className="px-2 py-2">
          <Button
            variant={"secondary"}
            onClick={() => {
              onReset();
              setIsOpen(false);
            }}
            className="w-full rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            Reset Filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
