import React from "react";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, className = "", placeholder = "Pilih tanggal" }: DatePickerProps) {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue + 'T00:00:00');
      onChange(newDate);
    }
  };

  return (
    <input
      type="date"
      value={formatDate(value)}
      onChange={handleChange}
      className={`w-full border rounded px-3 py-2 ${className}`}
      placeholder={placeholder}
    />
  );
}
