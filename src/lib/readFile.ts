export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface ReadResult {
  text: string;
  encoding: string;
}

const tryDecode = (bytes: Uint8Array, encoding: string): string | null => {
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
};

const countHalfWidthKana = (text: string): number =>
  (text.match(/[｡-ﾟ]/g) ?? []).length;

/**
 * 文字コードを自動判別してテキストファイルを読み込む。
 * UTF-8 / UTF-16（BOM付き）/ Shift_JIS / EUC-JP に対応。
 */
export async function readTextFile(file: File): Promise<ReadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ファイルサイズが大きすぎます（上限 5MB）');
  }
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { text: new TextDecoder('utf-16le').decode(bytes), encoding: 'UTF-16LE' };
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { text: new TextDecoder('utf-16be').decode(bytes), encoding: 'UTF-16BE' };
  }

  // TextDecoder は UTF-8 の BOM を自動で取り除く
  const utf8 = tryDecode(bytes, 'utf-8');
  if (utf8 !== null) {
    if (utf8.includes('\u0000')) {
      throw new Error('テキストファイルではない可能性があります');
    }
    return { text: utf8, encoding: 'UTF-8' };
  }

  const sjis = tryDecode(bytes, 'shift_jis');
  const eucjp = tryDecode(bytes, 'euc-jp');
  if (sjis !== null && eucjp !== null) {
    // どちらでも読める場合、誤判定側には半角カナが大量に現れるため少ない方を採用する
    return countHalfWidthKana(eucjp) < countHalfWidthKana(sjis)
      ? { text: eucjp, encoding: 'EUC-JP' }
      : { text: sjis, encoding: 'Shift_JIS' };
  }
  if (sjis !== null) return { text: sjis, encoding: 'Shift_JIS' };
  if (eucjp !== null) return { text: eucjp, encoding: 'EUC-JP' };

  throw new Error('文字コードを判別できませんでした');
}
