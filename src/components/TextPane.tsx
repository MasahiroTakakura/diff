'use client';

import React, { useId, useRef, useState } from 'react';
import { countLines } from '@/lib/normalize';

const ACCEPT =
  '.txt,.csv,.tsv,.log,.md,.json,.xml,.html,.css,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.sql,.ini,.yaml,.yml,text/*';

const palette = {
  blue: {
    badge: 'bg-blue-500',
    focus: 'focus:ring-blue-500/20 focus:border-blue-500',
    button: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    drag: 'border-blue-500 bg-blue-50',
  },
  purple: {
    badge: 'bg-purple-500',
    focus: 'focus:ring-purple-500/20 focus:border-purple-500',
    button: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    drag: 'border-purple-500 bg-purple-50',
  },
} as const;

interface TextPaneProps {
  name: 'A' | 'B';
  color: keyof typeof palette;
  value: string;
  fileName: string | null;
  onChange: (text: string) => void;
  onFile: (file: File) => void;
  onCopy: () => void;
  onClear: () => void;
}

const TextPane: React.FC<TextPaneProps> = ({
  name,
  color,
  value,
  fileName,
  onChange,
  onFile,
  onCopy,
  onClear,
}) => {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const c = palette[color];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label htmlFor={id} className="text-lg font-semibold text-gray-800 flex items-center">
          <span
            className={`w-8 h-8 ${c.badge} text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3`}
          >
            {name}
          </span>
          テキスト{name}
        </label>
        <div className="text-xs text-gray-500 tabular-nums">
          {value.length.toLocaleString()} 文字 / {countLines(value).toLocaleString()} 行
        </div>
      </div>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        spellCheck={false}
        placeholder={`テキスト${name}を入力、貼り付け、またはファイルをドロップ...`}
        className={`w-full h-72 p-4 border-2 rounded-2xl shadow-sm focus:ring-4 focus:outline-none resize-y transition-colors text-gray-800 placeholder-gray-400 font-mono text-sm leading-relaxed ${c.focus} ${
          dragging ? c.drag : 'border-gray-200 bg-white'
        }`}
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            // 同じファイルを再度選択できるようにリセット
            e.target.value = '';
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${c.button}`}
        >
          📁 ファイル読み込み
        </button>
        <button
          type="button"
          onClick={onCopy}
          disabled={!value}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${c.button}`}
        >
          📋 コピー
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={!value}
          className="px-3 py-1.5 text-xs rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✕ クリア
        </button>
        {fileName && (
          <span className="text-xs text-gray-500 truncate max-w-full" title={fileName}>
            {fileName}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextPane;
