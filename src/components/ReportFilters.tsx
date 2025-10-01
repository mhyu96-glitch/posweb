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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Label } from "./ui/label";

interface ReportFiltersProps {
  onFilterChange: (
    mode: "all" | "daily" | "monthly" | "yearly",
    value?: { dateRange?: DateRange; month?: number; year?: number }
  ) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
  categories: string[];
}

const months = [
  { value: 1, label: "Januari" }, { value: 2, label: "Februari" },
  { value: 3, label: "Maret" }, { value: 4, label: "April" },
  { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "Agustus" },
  { value: 9, label: "September" }, { value: 10, label: "Oktober" },
  { value: 11, label: "November" }, { value: 12, label: "Desember" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export const ReportFilters = ({ onFilterChange, onCategoryChange, onClearFilters, categories }: ReportFiltersProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [date, setDate] = useState<DateRange | undefined>();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange);
    if (selectedRange) {
      onFilterChange("daily", { dateRange: selectedRange });
    }
  };

  const handleMonthYearChange = (type: "month" | "year", value: string) => {
    const numValue = parseInt(value, 10);
    let newMonth = month;
    let newYear = year;

    if (type === "month") {
      newMonth = numValue;
      setMonth(numValue);
    } else {
      newYear = numValue;
      setYear(numValue);
    }
    onFilterChange("monthly", { month: newMonth, year: newYear });
  };
  
  const handleYearChange = (value: string) => {
    const numValue = parseInt(value, 10);
    setYear(numValue);
    onFilterChange("yearly", { year: numValue });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      onClearFilters();
    } else if (value === "daily") {
      onFilterChange("daily", { dateRange: date });
    } else if (value === "monthly") {
      onFilterChange("monthly", { month, year });
    } else if (value === "yearly") {
      onFilterChange("yearly", { year });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="daily">Harian</TabsTrigger>
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          <TabsTrigger value="yearly">Tahunan</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-full md:w-[300px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d MMM yyyy", { locale: id })} -{" "}
                      {format(date.to, "d MMM yyyy", { locale: id })}
                    </>
                  ) : (
                    format(date.from, "d MMM yyyy", { locale: id })
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
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </TabsContent>
        <TabsContent value="monthly" className="mt-4 flex gap-2">
          <Select value={month.toString()} onValueChange={(v) => handleMonthYearChange("month", v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year.toString()} onValueChange={(v) => handleMonthYearChange("year", v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
        <TabsContent value="yearly" className="mt-4">
          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
      </Tabs>
      <div className="flex items-center gap-2">
        <Label htmlFor="category-filter" className="flex-shrink-0">Filter Kategori:</Label>
        <Select onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}>
          <SelectTrigger id="category-filter" className="w-full md:w-[240px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};