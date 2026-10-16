import { useState } from "react";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DeparturePickerProps {
  id: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  invalid?: boolean;
}

// Emits a full Date only once both a day and a time are picked, otherwise null
export function DeparturePicker({
  id,
  value,
  onChange,
  invalid,
}: DeparturePickerProps) {
  const [day, setDay] = useState<Date | undefined>(value ?? undefined);
  const [time, setTime] = useState(value ? format(value, "HH:mm") : "");
  const [calendarOpen, setCalendarOpen] = useState(false);

  function emit(nextDay: Date | undefined, nextTime: string) {
    if (!nextDay || !nextTime) return onChange(null);
    const [hours, minutes] = nextTime.split(":").map(Number);
    onChange(setMinutes(setHours(startOfDay(nextDay), hours), minutes));
  }

  return (
    <div className="flex gap-2">
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid || undefined}
            className={cn(
              "h-9 flex-1 justify-start font-normal",
              !day && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {day ? format(day, "EEE, MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={day}
            defaultMonth={day}
            disabled={{ before: startOfDay(new Date()) }}
            onSelect={(next) => {
              setDay(next);
              emit(next, time);
              setCalendarOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        aria-label="Departure time"
        value={time}
        onChange={(e) => {
          setTime(e.target.value);
          emit(day, e.target.value);
        }}
        aria-invalid={invalid || undefined}
        className="h-9 w-32 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
      />
    </div>
  );
}
