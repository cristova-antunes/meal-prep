"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type WeekOption = {
  value: string;
  label: string;
  description: string;
};

type WeekPickerProps = {
  options: WeekOption[];
  selectedValue: string;
};

export default function WeekPicker({
  options,
  selectedValue,
}: WeekPickerProps) {
  const router = useRouter();

  function handleChange(value: string) {
    let url = "/create-meal-prep";

    if (value.startsWith("id:")) {
      const id = value.slice(3);
      url += `?weekId=${encodeURIComponent(id)}`;
    } else if (value.startsWith("week:")) {
      const [, week, year] = value.split(":");
      url += `?week=${encodeURIComponent(week)}&year=${encodeURIComponent(year)}`;
    }

    router.push(url);
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">
        Select a week to create or edit
      </div>
      <Select value={selectedValue} onValueChange={handleChange}>
        <SelectTrigger className="w-full h-auto!">
          <SelectValue placeholder="Choose a week" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="space-y-0.5 text-left">
                <div>{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
