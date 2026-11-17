'use client';

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import DiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { createTwoFilesPatch, diffLines } from 'diff';
import TextPane from '@/components/TextPane';
import RakutenAd from '@/components/RakutenAd';
import {
  CompareOptions,
  defaultCompareOptions,
  hasActiveOption,
  normalizeText,
} from '@/lib/normalize';
import { readTextFile } from '@/lib/readFile';

type Granularity = 'chars' | 'words' | 'lines';

interface Settings {
  splitView: boolean;
  granularity: Granularity;
  showDiffOnly: boolean;
  options: CompareOptions;
}

const defaultSettings: Settings = {
  splitView: true,
  granularity: 'chars',
  showDiffOnly: false,
  options: defaultCompareOptions,
};

// 保存するのは表示設定のみ。入力テキストはブラウザにも保存しない。
const SETTINGS_KEY = 'text-diff-settings';

const SAMPLE_A = `院内連絡　第12号
件名：受付窓口の運用変更について

1. 変更日　２０２６年４月１日（水）
2. 受付時間　8:30～11:00
3. 担当　医事課　外来係
4. 問い合わせ先　内線 1234

再来受付機は正面玄関に3台設置しています。
紹介状をお持ちの方は１番窓口へご案内ください。`;

const SAMPLE_B = `院内連絡　第12号
件名：受付窓口の運用変更について

1. 変更日　2026年4月1日（水）
2. 受付時間　8:30～11:30
3. 担当　医事課　外来係
4. 問い合わせ先　内線 1235

再来受付機は正面玄関に4台設置しています。
紹介状をお持ちの方は1番窓口へご案内ください。
予約のない方は総合案内へお越しください。`;

const optionLabels: { key: keyof CompareOptions; label: string; hint: string }[] = [
  { key: 'ignoreWidth', label: '全角/半角を区別しない', hint: '「１２３」と「123」、「ｶﾅ」と「カナ」を同じとみなします' },
  { key: 'ignoreCase', label: '大文字/小文字を区別しない', hint: '「ABC」と「abc」を同じとみなします' },
  { key: 'ignoreWhitespace', label: '空白の違いを無視', hint: '空白の数、全角スペース・タブ、行頭行末の空白の違いを無視します' },
  { key: 'ignoreBlankLines', label: '空行を無視', hint: '空行の有無を無視します' },
];

const granularityLabels: { key: Granularity; label: string }[] = [
  { key: 'chars', label: '文字' },
  { key: 'words', label: '単語' },
  { key: 'lines', label: '行のみ' },
];

const monoFont =
  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace';

const diffStyles = {
  diffContainer: {
    pre: {
      backgroundColor: 'transparent',
      fontSize: '14px',
      lineHeight: '1.6',
      fontFamily: monoFont,
    },
  },
  line: { padding: '2px 8px', borderBottom: '1px solid #f3f4f6' },
  gutter: {
    padding: '2px 8px',
    backgroundColor: '#f9fafb',
    borderRight: '1px solid #e5e7eb',
    color: '#6b7280',
    fontSize: '12px',
    fontFamily: monoFont,
  },
  diffRemoved: { backgroundColor: '#fef2f2', color: '#b91c1c' },
  diffAdded: { backgroundColor: '#f0fdf4', color: '#15803d' },
  wordDiff: { padding: '1px 0', borderRadius: '2px' },
  wordAdded: { backgroundColor: '#86efac', color: '#14532d' },
  wordRemoved: { backgroundColor: '#fca5a5', color: '#7f1d1d' },
};

const segmentClass = (active: boolean) =>
  `px-3 py-1.5 text-sm transition-colors ${
    active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
  }`;

const TextDiffApp: React.FC = () => {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [fileA, setFileA] = useState<string | null>(null);
  const [fileB, setFileB] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 表示設定の復元と保存
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          ...defaultSettings,
          ...parsed,
          options: { ...defaultCompareOptions, ...parsed.options },
        });
      }
    } catch {
      // 保存内容が壊れている場合は既定値を使う
    }
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // 保存できない環境では何もしない
    }
  }, [settings, settingsLoaded]);

  const notify = useCallback((message: string, error = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const loadFile = async (file: File, side: 'A' | 'B') => {
    try {
      const { text, encoding } = await readTextFile(file);
      if (side === 'A') {
        setTextA(text);
        setFileA(`${file.name}（${encoding}）`);
      } else {
        setTextB(text);
        setFileB(`${file.name}（${encoding}）`);
      }
      notify(`${file.name} を読み込みました（${encoding}）`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました', true);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${label}をコピーしました`);
    } catch {
      notify(`${label}のコピーに失敗しました`, true);
    }
  };

  const swapTexts = () => {
    setTextA(textB);
    setTextB(textA);
    setFileA(fileB);
    setFileB(fileA);
  };

  const clearAll = () => {
    setTextA('');
    setTextB('');
    setFileA(null);
    setFileB(null);
  };

  const loadSample = () => {
    setTextA(SAMPLE_A);
    setTextB(SAMPLE_B);
    setFileA(null);
    setFileB(null);
  };

  // 入力中の操作を妨げないよう、差分計算は遅延させた値で行う
  const deferredA = useDeferredValue(textA);
  const deferredB = useDeferredValue(textB);
  const { options } = settings;

  const normalizedA = useMemo(() => normalizeText(deferredA, options), [deferredA, options]);
  const normalizedB = useMemo(() => normalizeText(deferredB, options), [deferredB, options]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    // 最終行の改行有無だけで差分行と数えないよう、末尾に改行を補って比較する
    const withEol = (t: string) => (t === '' || t.endsWith('\n') ? t : `${t}\n`);
    for (const part of diffLines(withEol(normalizedA), withEol(normalizedB))) {
      const count = part.count ?? 0;
      if (part.added) added += count;
      else if (part.removed) removed += count;
      else unchanged += count;
    }
    return { added, removed, unchanged };
  }, [normalizedA, normalizedB]);

  const hasInput = deferredA !== '' || deferredB !== '';
  const identical = hasInput && normalizedA === normalizedB;
  const optionsActive = hasActiveOption(options);

  const buildPatch = () =>
    createTwoFilesPatch('テキストA', 'テキストB', normalizedA, normalizedB, '', '', { context: 3 });

  const downloadPatch = () => {
    const blob = new Blob([buildPatch()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-diff.diff';
    a.click();
    URL.revokeObjectURL(url);
  };

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              テキスト比較アプリ
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              入力したテキストはブラウザ内だけで処理され、外部に送信・保存されません（本サイトには広告が含まれます）
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              サンプル
            </button>
            <button
              type="button"
              onClick={swapTexts}
              disabled={!textA && !textB}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⇄ A/B入れ替え
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={!textA && !textB}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              すべてクリア
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-6">
        {/* テキストエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TextPane
            name="A"
            color="blue"
            value={textA}
            fileName={fileA}
            onChange={(text) => setTextA(text)}
            onFile={(file) => loadFile(file, 'A')}
            onCopy={() => copyToClipboard(textA, 'テキストA')}
            onClear={() => {
              setTextA('');
              setFileA(null);
            }}
          />
          <TextPane
            name="B"
            color="purple"
            value={textB}
            fileName={fileB}
            onChange={(text) => setTextB(text)}
            onFile={(file) => loadFile(file, 'B')}
            onCopy={() => copyToClipboard(textB, 'テキストB')}
            onClear={() => {
              setTextB('');
              setFileB(null);
            }}
          />
        </div>

        {/* 比較設定 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">表示</span>
              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  aria-pressed={settings.splitView}
                  onClick={() => update({ splitView: true })}
                  className={segmentClass(settings.splitView)}
                >
                  左右
                </button>
                <button
                  type="button"
                  aria-pressed={!settings.splitView}
                  onClick={() => update({ splitView: false })}
                  className={segmentClass(!settings.splitView)}
                >
                  上下
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">強調単位</span>
              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                {granularityLabels.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={settings.granularity === key}
                    onClick={() => update({ granularity: key })}
                    className={segmentClass(settings.granularity === key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showDiffOnly}
                onChange={(e) => update({ showDiffOnly: e.target.checked })}
                className="w-4 h-4 accent-blue-600"
              />
              差分のある箇所だけ表示
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">無視する違い</span>
            {optionLabels.map(({ key, label, hint }) => (
              <label
                key={key}
                title={hint}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) => update({ options: { ...options, [key]: e.target.checked } })}
                  className="w-4 h-4 accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* 差分表示 */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">差分表示</h2>
              {hasInput && (
                <div className="flex flex-wrap gap-2 text-sm tabular-nums" aria-live="polite">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                    − 削除 {stats.removed.toLocaleString()} 行
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                    ＋ 追加 {stats.added.toLocaleString()} 行
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700">
                    一致 {stats.unchanged.toLocaleString()} 行
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(buildPatch(), '差分（unified形式）')}
                disabled={!hasInput || identical}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📋 差分をコピー
              </button>
              <button
                type="button"
                onClick={downloadPatch}
                disabled={!hasInput || identical}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⬇ 差分を保存
              </button>
            </div>
          </div>

          {optionsActive && hasInput && (
            <p className="px-4 sm:px-6 py-2 text-xs text-amber-800 bg-amber-50 border-b border-amber-200">
              「無視する違い」が有効なため、下の表示は整形後のテキストです（元の入力内容とは表記が異なる場合があります）。
            </p>
          )}

          <div className="p-4 sm:p-6">
            {!hasInput ? (
              <p className="py-12 text-center text-gray-500">
                テキストA・Bを入力すると、ここに差分が表示されます
              </p>
            ) : identical ? (
              <div className="py-12 text-center">
                <p className="text-lg font-semibold text-green-700">✓ 差分はありません</p>
                <p className="text-sm text-gray-500 mt-1">
                  {deferredA === deferredB
                    ? 'テキストAとテキストBは完全に一致しています'
                    : '入力内容は完全一致ではありませんが、無視する設定（改行コードを含む）の範囲内で一致しています'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl overflow-x-auto border border-gray-200">
                <DiffViewer
                  oldValue={normalizedA}
                  newValue={normalizedB}
                  splitView={settings.splitView}
                  compareMethod={
                    settings.granularity === 'words' ? DiffMethod.WORDS : DiffMethod.CHARS
                  }
                  disableWordDiff={settings.granularity === 'lines'}
                  showDiffOnly={settings.showDiffOnly}
                  extraLinesSurroundingDiff={2}
                  codeFoldMessageRenderer={(total) => (
                    <span className="text-xs text-gray-600">
                      同じ内容の {total} 行を表示
                    </span>
                  )}
                  leftTitle={settings.splitView ? 'テキストA' : 'テキストA → テキストB'}
                  rightTitle="テキストB"
                  useDarkTheme={false}
                  styles={diffStyles}
                />
              </div>
            )}
          </div>
        </section>
        <RakutenAd />
      </main>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-xl text-sm text-white ${
            toast.error ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TextDiffApp;
