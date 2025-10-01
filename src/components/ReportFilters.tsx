"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface ReportFiltersProps {
  onFilterChange: (
    mode: "all" | "daily" | "monthly" | "yearly",
    value?: { dateRange?: DateRange; month?: number; year?: number }
  ) => void;
  onClearFilters: () => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const ReportFilters = ({
  onFilterChange,
  onClearFilters,
  onCategoryChange,
  categories,
}: ReportFiltersProps) => {
  const [mode, setMode] = useState<"all" | "daily" | "monthly" | "yearly">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [category, setCategory] = useState("");

  const handleModeChange = (newMode: "all" | "daily" | "monthly" | "yearly") => {
    setMode(newMode);
    if (newMode === "all") {
      onFilterChange("all");
    } else {
      applyFilters(newMode, { dateRange, month, year });
    }
  };

  const applyFilters = (
    currentMode: "all" | "daily" | "monthly" | "yearly",
    values: { dateRange?: DateRange; month?: number; year?: number }
  ) => {
    if (currentMode === "daily") {
      onFilterChange("daily", { dateRange: values.dateRange });
    } else if (currentMode === "monthly") {
      onFilterChange("monthly", { month: values.month, year: values.year });
    } else if (currentMode === "yearly") {
      onFilterChange("yearly", { year: values.year });
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    applyFilters(mode, { dateRange: range, month, year });
  };

  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value);
    setMonth(newMonth);
    applyFilters(mode, { dateRange, month: newMonth, year });
  };

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setYear(newYear);
    applyFilters(mode, { dateRange, month, year: newYear });
  };

  const handleCategoryChange = (value: string) => {
    const newCategory = value === "all" ? "" : value;
    setCategory(newCategory);
    onCategoryChange(newCategory);
  };

  const handleClear = () => {
    setMode("all");
    setDateRange(undefined);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setCategory("");
    onClearFilters();
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("id-ID", { month: "long" }),
  }));

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <Tabs value={mode} onValueChange={(v) => handleModeChange(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="daily">Harian</TabsTrigger>
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          <TabsTrigger value="yearly">Tahunan</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "daily" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pilih rentang tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {mode === "monthly" && (
        <div className="flex gap-2">
          <Select value={month.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === "yearly" && (
        <Select value={year.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Semua Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClear}>
        Reset
      </Button>
    </div>
  );
};