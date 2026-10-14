"use client";

// กราฟของ Dashboard — SVG ล้วน
// สเปกตาม dataviz : แท่งไม่เกิน 24px ปลายมน 4px ฐานเหลี่ยม / เส้นกริด hairline ทึบ /
// ระยะห่าง 2px ระหว่างชิ้นที่ติดกัน / tooltip ทุกแท่ง / ข้อความใช้สีตัวอักษรไม่ใช่สีข้อมูล / มีมุมมองตาราง

import { Table2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const chartInk = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  surface: "#ffffff",
};

/** สีหมวดหมู่ (ลำดับคงที่ — ผ่านการตรวจ CVD แบบ all-pairs สำหรับ 3 ช่องแรก) */
export const categorical = ["#2a78d6", "#eb6834", "#1baf7a"];

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** ตัวเลขแกนแบบกลมๆ 0 / 50,000 / 100,000 */
function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

export const compact = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : String(Math.round(n)));

type Tip = { x: number; y: number; content: ReactNode } | null;

function TooltipBox({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] shadow-lg" style={{ left: tip.x, top: tip.y - 8 }}>
      {tip.content}
    </div>
  );
}

/** สลับกราฟ ↔ ตาราง (ตัวแทนที่อ่านได้โดยไม่ต้องดูสี) */
export function ChartCard({
  title,
  subtitle,
  table,
  children,
  legend,
  tableLabel,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  table: { head: string[]; rows: (string | number)[][] };
  children: ReactNode;
  legend?: ReactNode;
  tableLabel: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <figcaption className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-bold text-slate-900">{title}</div>
          {subtitle && <div className="text-[11.5px] text-slate-500">{subtitle}</div>}
        </div>
        <button
          type="button"
          onClick={() => setAsTable(!asTable)}
          aria-pressed={asTable}
          className={cn("flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold", asTable ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50")}
        >
          <Table2 className="size-3.5" /> {tableLabel}
        </button>
      </figcaption>
      {legend && !asTable && <div className="mb-2">{legend}</div>}
      <div className="min-h-0 flex-1">
        {asTable ? (
          <div className="thin-scroll max-h-[260px] overflow-auto rounded-lg border border-slate-100">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="sticky top-0 bg-slate-50 text-left text-slate-500">
                <tr>
                  {table.head.map((h, i) => (
                    <th key={h} className={cn("px-3 py-1.5 font-semibold", i > 0 && "text-right")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {r.map((cell, j) => (
                      <td key={j} className={cn("px-3 py-1.5 text-slate-700", j > 0 && "text-right")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </figure>
  );
}

export type ColumnDatum = { key: string; label: string; value: number; emphasis?: boolean; tip: ReactNode };

/** กราฟแท่งตั้ง (ซีรีส์เดียว) — แท่งที่ emphasis ใช้สีเน้น ที่เหลือเป็นสีรอง */
export function ColumnChart({ data, height = 220, color, muted, format }: { data: ColumnDatum[]; height?: number; color: string; muted: string; format: (n: number) => string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [hover, setHover] = useState<string | null>(null);
  const padL = 44;
  const padB = 24;
  const padT = 18;
  const innerW = Math.max(0, width - padL - 4);
  const innerH = height - padB - padT;
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 1));
  const top = ticks[ticks.length - 1] || 1;
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.min(24, band * 0.56);
  const y = (v: number) => padT + innerH - (v / top) * innerH;
  const last = data.findLast((d) => d.emphasis);

  return (
    <div ref={ref} className="relative w-full" style={{ height }} onPointerLeave={() => (setTip(null), setHover(null))}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="column chart">
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={padL} x2={width} y1={y(tk)} y2={y(tk)} stroke={tk === 0 ? chartInk.axis : chartInk.grid} strokeWidth={1} shapeRendering="crispEdges" />
              <text x={padL - 8} y={y(tk)} dy="0.32em" textAnchor="end" fontSize={10.5} fill={chartInk.muted} className="tabular-nums">
                {compact(tk)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = padL + band * i + band / 2;
            const h = Math.max(0, y(0) - y(d.value));
            const r = Math.min(4, h);
            const x = cx - barW / 2;
            const yTop = y(d.value);
            const fill = d.emphasis ? color : muted;
            return (
              <g key={d.key}>
                <path
                  d={`M${x},${yTop + h} L${x},${yTop + r} Q${x},${yTop} ${x + r},${yTop} L${x + barW - r},${yTop} Q${x + barW},${yTop} ${x + barW},${yTop + r} L${x + barW},${yTop + h} Z`}
                  fill={fill}
                  opacity={hover && hover !== d.key ? 0.55 : 1}
                />
                <text x={cx} y={height - 7} textAnchor="middle" fontSize={10.5} fill={d.emphasis ? chartInk.secondary : chartInk.muted} fontWeight={d.emphasis ? 600 : 400}>
                  {d.label}
                </text>
                {/* พื้นที่รับเมาส์กว้างเต็มช่อง ไม่ต้องเล็งให้โดนแท่ง */}
                <rect
                  x={padL + band * i}
                  y={padT}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  tabIndex={0}
                  onPointerMove={() => {
                    setHover(d.key);
                    setTip({ x: cx, y: yTop, content: d.tip });
                  }}
                  onFocus={() => {
                    setHover(d.key);
                    setTip({ x: cx, y: yTop, content: d.tip });
                  }}
                  onBlur={() => (setTip(null), setHover(null))}
                />
              </g>
            );
          })}
          {last && (
            <text x={padL + band * data.indexOf(last) + band / 2} y={y(last.value) - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill={chartInk.primary} className="tabular-nums">
              {format(last.value)}
            </text>
          )}
        </svg>
      )}
      <TooltipBox tip={tip} />
    </div>
  );
}

export type Segment = { key: string; label: string; value: number; color: string };

/** แท่งแนวนอนแบบ 100% (ส่วนต่อทั้งหมด) + legend ที่มีตัวเลขเสมอ */
export function StackedBar({ segments, format }: { segments: Segment[]; format: (n: number) => string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gap = 2;
  const visible = segments.filter((s) => s.value > 0);
  const usable = Math.max(0, width - gap * (visible.length - 1));
  // ตำแหน่งเริ่มของแต่ละชิ้น คำนวณไว้ก่อนวาด
  const placed = visible.map((s, i) => {
    const before = visible.slice(0, i).reduce((sum, x) => sum + (x.value / total) * usable + gap, 0);
    return { s, x: before, w: (s.value / total) * usable };
  });
  return (
    <div>
      <div ref={ref} className="relative h-6 w-full" onPointerLeave={() => setTip(null)}>
        {width > 0 && (
          <svg width={width} height={24} role="img" aria-label="share">
            {placed.map(({ s, x, w }, i) => {
              const first = i === 0;
              const lastSeg = i === visible.length - 1;
              const r = 4;
              const path = `M${x + (first ? r : 0)},0 L${x + w - (lastSeg ? r : 0)},0 ${lastSeg ? `Q${x + w},0 ${x + w},${r} L${x + w},${24 - r} Q${x + w},24 ${x + w - r},24` : `L${x + w},24`} L${x + (first ? r : 0)},24 ${first ? `Q${x},24 ${x},${24 - r} L${x},${r} Q${x},0 ${x + r},0` : `L${x},0`} Z`;
              return (
                <path
                  key={s.key}
                  d={path}
                  fill={s.color}
                  tabIndex={0}
                  onPointerMove={() => setTip({ x: x + w / 2, y: 0, content: <span><b className="tabular-nums">{format(s.value)}</b> <span className="text-slate-500">· {s.label} ({Math.round((s.value / total) * 100)}%)</span></span> })}
                  onFocus={() => setTip({ x: x + w / 2, y: 0, content: <span><b>{format(s.value)}</b> · {s.label}</span> })}
                  onBlur={() => setTip(null)}
                />
              );
            })}
          </svg>
        )}
        <TooltipBox tip={tip} />
      </div>
      <ul className="mt-3 grid gap-1.5">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-[12.5px]">
            <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 text-slate-600">{s.label}</span>
            <span className="font-semibold tabular-nums text-slate-900">{format(s.value)}</span>
            <span className="w-10 text-right tabular-nums text-slate-500">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** แท่งแนวนอนซีรีส์เดียว (เช่น อัตราการเช่ารายโซน) ค่าอยู่ที่ปลายแท่ง */
export function HBars({ rows, color, track }: { rows: { key: string; label: string; ratio: number; value: string; tip: ReactNode }[]; color: string; track: string }) {
  const [tip, setTip] = useState<Tip>(null);
  const box = useRef<HTMLDivElement>(null);
  const show = (el: HTMLElement, clientX: number | null, content: ReactNode) => {
    const root = box.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const scale = rect.width / root.offsetWidth || 1;
    const bar = el.getBoundingClientRect();
    const x = clientX === null ? bar.left + bar.width / 2 : clientX;
    setTip({ x: (x - rect.left) / scale, y: (bar.top - rect.top) / scale, content });
  };
  return (
    <div ref={box} className="relative space-y-2.5" onPointerLeave={() => setTip(null)}>
      {rows.map((r) => (
        <div key={r.key} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_auto] items-center gap-3">
          <span className="truncate text-[12.5px] text-slate-600">{r.label}</span>
          <span
            className="relative h-3 rounded-[4px]"
            style={{ background: track }}
            tabIndex={0}
            onPointerMove={(e) => show(e.currentTarget, e.clientX, r.tip)}
            onFocus={(e) => show(e.currentTarget, null, r.tip)}
            onBlur={() => setTip(null)}
          >
            <span className="absolute inset-y-0 left-0 rounded-[4px]" style={{ width: `${Math.max(2, r.ratio * 100)}%`, background: color }} />
          </span>
          <span className="w-12 text-right text-[12.5px] font-semibold tabular-nums text-slate-900">{r.value}</span>
        </div>
      ))}
      <TooltipBox tip={tip} />
    </div>
  );
}

/** เส้นแนวโน้มเล็กในการ์ดตัวเลข */
export function Sparkline({ values, color, width = 96, height = 28 }: { values: number[]; color: string; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 6) + 3, height - 4 - ((v - min) / span) * (height - 8)]);
  const d = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width={width} height={height} aria-hidden>
      <path d={d} fill="none" stroke="#c3c2b7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={4} fill={color} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}
