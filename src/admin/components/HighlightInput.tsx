// ============================================================
// HighlightInput — tag-style input for highlights
// ============================================================
import React, { useState } from 'react';

interface HighlightInputProps {
  highlights: string[];
  onChange: (highlights: string[]) => void;
}

export default function HighlightInput({ highlights, onChange }: HighlightInputProps) {
  const [value, setValue] = useState('');

  function add() {
    const trimmed = value.trim();
    if (trimmed && !highlights.includes(trimmed)) {
      onChange([...highlights, trimmed]);
      setValue('');
    }
  }

  function remove(index: number) {
    onChange(highlights.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {highlights.map((h, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"
          >
            {h}
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-0.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入亮点后按回车"
          className="flex-1 px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
        >
          添加
        </button>
      </div>
    </div>
  );
}
