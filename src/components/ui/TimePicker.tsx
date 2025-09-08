import React from "react";

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export default function TimePicker({ value, onChange, className = "", placeholder = "Pilih waktu" }: TimePickerProps) {
  const formatTime12Hour = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const parseTime12Hour = (timeStr: string) => {
    const [time, ampm] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (ampm === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (ampm === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return { hours: hour24, minutes };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const formatTime24Hour = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={formatTime24Hour(value)}
        onChange={handleChange}
        className={`border rounded px-3 py-2 flex-1 ${className}`}
        placeholder={placeholder}
      />
      <span className="text-sm text-gray-600 min-w-[70px] font-medium">
        {formatTime12Hour(value)}
      </span>
    </div>
  );
}
