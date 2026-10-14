import type { HLang } from "../i18n";

/** ธงแบบ SVG — Windows แสดง emoji ธงไม่ได้ จึงวาดเอง */
export function Flag({ lang, size = 18 }: { lang: HLang; size?: number }) {
  const h = Math.round(size * 0.7);
  const common = { width: size, height: h, viewBox: "0 0 30 21", className: "shrink-0 rounded-[3px] ring-1 ring-black/10" } as const;
  switch (lang) {
    case "th":
      return (
        <svg {...common} aria-hidden>
          <rect width="30" height="21" fill="#A51931" />
          <rect y="3.5" width="30" height="14" fill="#F4F5F8" />
          <rect y="7" width="30" height="7" fill="#2D2A4A" />
        </svg>
      );
    case "en":
      return (
        <svg {...common} aria-hidden>
          <rect width="30" height="21" fill="#FFFFFF" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={i * 1.615} width="30" height="1.615" fill="#B22234" />
          ))}
          <rect width="13" height="11.3" fill="#3C3B6E" />
          {[2.5, 6.5, 10.5].map((x) =>
            [2.5, 5.6, 8.7].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill="#FFFFFF" />),
          )}
        </svg>
      );
    case "zh":
      return (
        <svg {...common} aria-hidden>
          <rect width="30" height="21" fill="#DE2910" />
          <polygon points="5,2.5 6.2,6 9.8,6 6.9,8.2 8,11.6 5,9.5 2,11.6 3.1,8.2 0.2,6 3.8,6" fill="#FFDE00" />
          {[
            [11, 2.2],
            [13, 4.4],
            [13, 7.6],
            [11, 9.8],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#FFDE00" />
          ))}
        </svg>
      );
    case "lo":
      return (
        <svg {...common} aria-hidden>
          <rect width="30" height="21" fill="#CE1126" />
          <rect y="5.25" width="30" height="10.5" fill="#002868" />
          <circle cx="15" cy="10.5" r="4.2" fill="#FFFFFF" />
        </svg>
      );
  }
}
