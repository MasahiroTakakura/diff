/* eslint-disable @next/next/no-img-element -- 楽天アフィリエイトの計測用画像はそのまま読み込む必要がある */
import React from 'react';

// 楽天アフィリエイトで発行された商品リンク（テキスト＋画像）を JSX に変換したもの。
// リンク先・画像 URL は発行されたタグから変更しないこと（変更すると成果が計測されない）。
const ut =
  'eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ';

const ITEM_URL = `https://hb.afl.rakuten.co.jp/ichiba/58e9805b.792120ee.58e98062.ca7c7cbf/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkitcut-ps%2F54581743121%2F&link_type=picttext&ut=${ut}%3D%3D`;
const BUY_URL = `https://hb.afl.rakuten.co.jp/ichiba/58e9805b.792120ee.58e98062.ca7c7cbf/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkitcut-ps%2F54581743121%2F%3Fscid%3Daf_pc_bbtn&link_type=picttext&ut=${ut}==`;
const IMAGE_URL =
  'https://hbb.afl.rakuten.co.jp/hgb/58e9805b.792120ee.58e98062.ca7c7cbf/?me_id=1301804&item_id=10146108&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fkitcut-ps%2Fcabinet%2Fitem%2F133%2Fp-348823.jpg%3F_ex%3D240x240&s=240x240&t=picttext';

const PRICE_NOTE =
  '[商品価格に関しましては、リンクが作成された時点と現時点で情報が変更されている場合がございます。]';

const linkProps = {
  target: '_blank',
  rel: 'nofollow sponsored noopener',
} as const;

const RakutenAd: React.FC = () => (
  <aside aria-label="広告" className="mt-8">
    <p className="text-xs text-gray-500 mb-2">PR（楽天アフィリエイト広告）</p>
    <div className="w-full max-w-[504px] border border-gray-300 rounded-xl bg-white p-2 flex flex-col sm:flex-row gap-3 overflow-hidden">
      <a {...linkProps} href={ITEM_URL} className="shrink-0 self-center">
        <img
          src={IMAGE_URL}
          alt={PRICE_NOTE}
          title={PRICE_NOTE}
          width={240}
          height={240}
          className="w-[240px] h-auto max-w-full"
        />
      </a>
      <div className="flex flex-col justify-between min-w-0 flex-1 p-1">
        <p className="text-xs leading-relaxed text-left break-words">
          <a {...linkProps} href={ITEM_URL} className="text-blue-700 hover:underline">
            [国内正規品] Keychron Nape Pro Bluetooth 5.3 / 2.4 GHz / 有線 トラックボールマウス キークロン
            [ギズモードと共同開発] ネイププロ ネーププロ バー型トラックボール 左手デバイス
            キーボードと使いやすい ショートカット マクロ 割り当て
          </a>
          <br />
          <span>価格：12,650円（税込、送料無料)</span>{' '}
          <span className="text-gray-400">(2026/11/17時点)</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <a {...linkProps} href={ITEM_URL}>
            <img
              src="https://static.affiliate.rakuten.co.jp/makelink/rl.svg"
              alt="楽天市場"
              className="h-[27px] w-auto"
            />
          </a>
          <a
            {...linkProps}
            href={BUY_URL}
            className="px-4 h-[27px] leading-[27px] rounded-2xl bg-[#bf0000] text-white text-xs font-medium text-center hover:opacity-90"
          >
            楽天で購入
          </a>
        </div>
      </div>
    </div>
  </aside>
);

export default RakutenAd;
