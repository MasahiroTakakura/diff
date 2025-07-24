'use client';

import React, { useState, useRef } from 'react';
import DiffViewer from 'react-diff-viewer-continued';

const TextDiffApp: React.FC = () => {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  // テキスト変更時の処理
  const handleTextChange = (text: string, isTextA: boolean) => {
    if (isTextA) {
      setTextA(text);
    } else {
      setTextB(text);
    }
  };

  // ファイル読み込み
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isTextA: boolean) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (isTextA) {
          setTextA(content);
        } else {
          setTextB(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // テキストをクリップボードにコピー
  const copyToClipboard = async (text: string, label: string) => {
    try {
      // navigator.clipboardが利用可能かチェック
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert(`${label}をクリップボードにコピーしました！`);
      } else {
        // フォールバック: 古いブラウザや開発環境用
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          alert(`${label}をクリップボードにコピーしました！`);
        } catch (err) {
          alert(`${label}のコピーに失敗しました。手動でコピーしてください。`);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      alert(`${label}のコピーに失敗しました。手動でコピーしてください。`);
    }
  };

  const clearTexts = () => {
    setTextA('');
    setTextB('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                テキスト比較アプリ
              </h1>
              <p className="text-gray-600 mt-2">リアルタイムでテキストの差分を確認</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearTexts}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                🗑️ クリア
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 差分統計 */}
        {(textA || textB) && (
          <div className="mb-6 animate-fade-in-up">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                  📊
                </span>
                文字数統計
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{textA.length}</div>
                  <div className="text-sm text-gray-600">テキストA文字数</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{textB.length}</div>
                  <div className="text-sm text-gray-600">テキストB文字数</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* テキストエリア */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                A
              </span>
              テキストA
            </label>
            <div className="relative">
              <textarea
                value={textA}
                onChange={(e) => handleTextChange(e.target.value, true)}
                placeholder="テキストAを入力してください..."
                className="w-full h-80 p-6 border-2 border-gray-200 rounded-2xl shadow-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-400 font-mono text-sm leading-relaxed"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {textA.length} 文字
                </div>
                <button
                  onClick={() => copyToClipboard(textA, 'テキストA')}
                  disabled={!textA}
                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📋
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  ref={fileInputARef}
                  type="file"
                  accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputARef.current?.click()}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  📁 ファイル読み込み
                </button>
              </div>
            </div>
          </div>
          
          <div className="group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                B
              </span>
              テキストB
            </label>
            <div className="relative">
              <textarea
                value={textB}
                onChange={(e) => handleTextChange(e.target.value, false)}
                placeholder="テキストBを入力してください..."
                className="w-full h-80 p-6 border-2 border-gray-200 rounded-2xl shadow-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-400 font-mono text-sm leading-relaxed"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {textB.length} 文字
                </div>
                <button
                  onClick={() => copyToClipboard(textB, 'テキストB')}
                  disabled={!textB}
                  className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📋
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  ref={fileInputBRef}
                  type="file"
                  accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputBRef.current?.click()}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  📁 ファイル読み込み
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 差分表示 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3 animate-pulse-slow">
                  ⚡
                </span>
                差分表示
              </h2>
              <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                {textA && textB ? 'リアルタイム更新中' : 'テキストを入力してください'}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <DiffViewer
                oldValue={textA}
                newValue={textB}
                splitView={true}
                leftTitle={
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                    テキストA
                  </div>
                }
                rightTitle={
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-purple-500 rounded-full mr-2"></span>
                    テキストB
                  </div>
                }
                useDarkTheme={false}
                styles={{
                  diffContainer: {
                    pre: {
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    },
                  },
                  line: {
                    padding: '4px 12px',
                    borderBottom: '1px solid #f3f4f6',
                  },
                  gutter: {
                    padding: '4px 12px',
                    backgroundColor: '#f9fafb',
                    borderRight: '1px solid #e5e7eb',
                    color: '#6b7280',
                    fontSize: '12px',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  },
                  diffRemoved: {
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                  },
                  diffAdded: {
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                  },
                  wordDiff: {
                    padding: '2px 4px',
                    borderRadius: '4px',
                  },
                  wordAdded: {
                    backgroundColor: '#bbf7d0',
                    color: '#166534',
                  },
                  wordRemoved: {
                    backgroundColor: '#fecaca',
                    color: '#991b1b',
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-gray-500 text-sm">
            Built with Next.js
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextDiffApp;
