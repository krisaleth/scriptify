import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface AdminSearchControlProps {
  placeholder: string;
  onSearch: (value: string) => void;
  tabValue: string; // Theo dõi tab để reset input khi sếp đổi mục quản lý
}

export function AdminSearchControl({ placeholder, onSearch, tabValue }: AdminSearchControlProps) {
  const [inputValue, setInputValue] = useState("");

  // Tự động làm sạch thanh search mỗi khi sếp đổi Tab (Nhạc -> Nghệ sĩ...)
  useEffect(() => {
    setInputValue("");
    onSearch("");
  }, [tabValue, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onSearch(val);
  };

  return (
    <div className="relative w-full max-w-md group">
      <Search 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" 
        size={18} 
      />
      
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-zinc-900/60 text-white rounded-xl py-3 pl-12 pr-10 outline-none border border-white/5 focus:border-green-500/20 transition-all font-bold italic text-sm placeholder:text-zinc-700 shadow-lg backdrop-blur-md"
      />

      {inputValue && (
        <button 
          onClick={() => { setInputValue(""); onSearch(""); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}