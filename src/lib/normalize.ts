export interface CompareOptions {
  /** 全角/半角の違いを無視する（NFKC正規化） */
  ignoreWidth: boolean;
  /** 英字の大文字/小文字の違いを無視する */
  ignoreCase: boolean;
  /** 空白（全角スペース・タブ含む）の数や行頭・行末の空白の違いを無視する */
  ignoreWhitespace: boolean;
  /** 空行を無視する */
  ignoreBlankLines: boolean;
}

export const defaultCompareOptions: CompareOptions = {
  ignoreWidth: false,
  ignoreCase: false,
  ignoreWhitespace: false,
  ignoreBlankLines: false,
};

export const hasActiveOption = (options: CompareOptions): boolean =>
  Object.values(options).some(Boolean);

/**
 * 比較前のテキスト整形。改行コード（CRLF/CR）の違いは常に吸収する。
 */
export function normalizeText(text: string, options: CompareOptions): string {
  let result = text.replace(/\r\n?/g, '\n');

  if (options.ignoreWidth) {
    result = result.normalize('NFKC');
  }
  if (options.ignoreCase) {
    result = result.toLowerCase();
  }
  if (options.ignoreWhitespace || options.ignoreBlankLines) {
    let lines = result.split('\n');
    if (options.ignoreWhitespace) {
      lines = lines.map((line) => line.replace(/[^\S\n]+/g, ' ').trim());
    }
    if (options.ignoreBlankLines) {
      lines = lines.filter((line) => line.trim() !== '');
    }
    result = lines.join('\n');
  }
  return result;
}

export function countLines(text: string): number {
  if (text === '') return 0;
  const lines = text.split('\n');
  // 末尾の改行は行数に含めない
  return lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
}
