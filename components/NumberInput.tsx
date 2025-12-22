
import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, placeholder, icon }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
        <input
          type="number"
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={placeholder || "0.00"}
          className="w-full pl-7 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800 font-medium"
        />
      </div>
    </div>
  );
};

export default NumberInput;
