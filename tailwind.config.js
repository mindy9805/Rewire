/** @type {import('tailwindcss').Config} */
// 品牌色以 CSS 變數定義（見 src/index.css），淺色／深色模式只需切換變數即可。
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: v('bg'), // 頁面底色（淺色：奶油白 #FAF8F4）
        surface: v('surface'), // 卡片底色
        soft: v('soft'), // 淺灰綠 #E9EEE7
        ink: v('ink'), // 主要文字（深灰黑 #303630）
        muted: v('muted'), // 次要文字
        line: v('line'), // 邊框
        sage: v('sage'), // 鼠尾草綠 #A8BBA3
        forest: v('forest'), // 深森林綠 #36594B
        apricot: v('apricot'), // 淺杏色 #E8CCB2
        accent: v('accent'), // 可互動元素的強調色（深色模式自動提亮）
        onaccent: v('onaccent'),
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif'],
        serif: ['"Noto Serif TC"', '"Songti TC"', 'serif'],
        display: ['"Playfair Display"', '"Noto Serif TC"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(48 54 48 / 0.04), 0 8px 24px -12px rgb(48 54 48 / 0.12)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        twinkle: { '0%,100%': { opacity: '0.25' }, '50%': { opacity: '1' } },
        // 輕遊戲化動畫：皆為短暫、柔和的動作；系統「減少動畫」時以 motion-safe 自動停用
        'buddy-float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        'buddy-hop': { '0%,100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-10px)' }, '60%': { transform: 'translateY(0)' } },
        pop: { '0%': { opacity: '0', transform: 'scale(.92)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        wiggle: { '0%,100%': { transform: 'rotate(0)' }, '92%': { transform: 'rotate(0)' }, '95%': { transform: 'rotate(-4deg)' }, '98%': { transform: 'rotate(4deg)' } },
        grow: { '0%': { transform: 'scaleY(.3)', opacity: '0' }, '100%': { transform: 'scaleY(1)', opacity: '1' } },
      },
      animation: {
        'fade-up': 'fade-up .4s ease-out both',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'buddy-float': 'buddy-float 4s ease-in-out infinite',
        'buddy-hop': 'buddy-hop .9s ease-out 2',
        pop: 'pop .35s ease-out both',
        wiggle: 'wiggle 4s ease-in-out infinite',
        grow: 'grow .6s ease-out both',
      },
    },
  },
  plugins: [],
};
