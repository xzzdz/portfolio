"use client";

import { Printer, Scissors, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { AppProvider } from "./AppContext";
import { AppRoot } from "./AppRoot";
import type { HLang } from "./i18n";
import { Receipt58 } from "./Receipt58";
import type { PrintJob, RouteParams, ScreenName } from "./types";

const labels = {
  th: { tear: "ฉีกกระดาษ", close: "ปิด" },
  en: { tear: "Tear off", close: "Close" },
};

type Paper = { id: number; job: PrintJob; lang: HLang; phase: "printing" | "done" | "tearing" };

/** ขนาดจริงของเครื่อง (CSS px) — จอ 360×720 dp ตามสเปก Sunmi V2 */
const SCREEN_W = 360;
const SCREEN_H = 720;
const PAPER_SPACE = 176;
const DEVICE_H = SCREEN_H + 70 + 34 + 4;
export const HANDHELD_NATURAL_HEIGHT = PAPER_SPACE + DEVICE_H;

export type HandheldDemoProps = {
  locale: Locale;
  /** ขนาดเทียบกับของจริง หรือ "fit" = ย่อให้พอดีความสูงจอ */
  scale?: number | "fit";
  /** ความสูงที่กันไว้ให้ส่วนอื่นของหน้า เวลา scale = "fit" */
  fitOffset?: number;
  framed?: boolean;
  initialScreen?: ScreenName;
  initialParams?: RouteParams;
  startLoggedIn?: boolean;
  className?: string;
};

export default function HandheldDemo({ locale, scale = 1, fitOffset = 120, framed = true, initialScreen, initialParams, startLoggedIn = true, className }: HandheldDemoProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [viewer, setViewer] = useState<Paper | null>(null);
  const [fit, setFit] = useState(1);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (scale !== "fit") return;
    const update = () => setFit(Math.max(0.55, Math.min(1, (window.innerHeight - fitOffset) / HANDHELD_NATURAL_HEIGHT)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [scale, fitOffset]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const print = useCallback((job: PrintJob, lang: HLang) => {
    const id = Date.now();
    setPapers((list) => [...list.filter((p) => p.phase !== "tearing").map((p) => ({ ...p, phase: "tearing" as const })), { id, job, lang, phase: "printing" }]);
    timers.current.push(
      window.setTimeout(() => setPapers((list) => list.filter((p) => p.phase !== "tearing" || p.id === id)), 450),
      window.setTimeout(() => setPapers((list) => list.map((p) => (p.id === id ? { ...p, phase: "done" } : p))), 2700),
    );
  }, []);

  const tear = (id: number) => {
    setPapers((list) => list.map((p) => (p.id === id ? { ...p, phase: "tearing" } : p)));
    timers.current.push(window.setTimeout(() => setPapers((list) => list.filter((p) => p.id !== id)), 450));
  };

  const app = (
    <AppProvider initialLang={locale} initialScreen={initialScreen} initialParams={initialParams} startLoggedIn={startLoggedIn} onPrint={print}>
      <AppRoot />
      {!framed && <InlinePrinter papers={papers} onView={setViewer} onTear={tear} label={labels[locale]} />}
    </AppProvider>
  );

  const viewerModal =
    viewer &&
    typeof document !== "undefined" &&
    createPortal(
      <ReceiptViewer
        label={labels[locale]}
        paper={viewer}
        onClose={() => setViewer(null)}
        onTear={() => {
          tear(viewer.id);
          setViewer(null);
        }}
      />,
      document.body,
    );

  if (!framed) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        {app}
        {viewerModal}
      </div>
    );
  }

  const zoom = scale === "fit" ? fit : scale;
  return (
    <div className={cn("relative mx-auto select-none", className)} style={{ width: (SCREEN_W + 24) * zoom, height: HANDHELD_NATURAL_HEIGHT * zoom }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ zoom, width: SCREEN_W + 24 }}>
        {/* กระดาษที่พิมพ์ออกมาจากช่องด้านบนของเครื่อง (อยู่ "หลัง" ตัวเครื่อง) */}
        <div className="relative" style={{ height: PAPER_SPACE }}>
          <div
            className="absolute bottom-[-26px] left-1/2 z-0 h-[202px] w-[288px] -translate-x-1/2 overflow-hidden"
            style={{ maskImage: "linear-gradient(to top, black 70%, transparent)", WebkitMaskImage: "linear-gradient(to top, black 70%, transparent)" }}
          >
            {papers.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={p.phase !== "done"}
                onClick={() => setViewer(p)}
                title="Open receipt"
                className={cn(
                  "group absolute bottom-0 left-0 w-full cursor-zoom-in bg-[#FDFDFB] px-[18px] pb-7 pt-4 text-left font-receipt text-[11.5px] leading-[1.35] text-black shadow-[0_0_12px_rgba(0,0,0,0.12)]",
                  p.phase === "printing" && "animate-[paper-feed_2.6s_steps(34)_both]",
                  p.phase === "tearing" && "animate-[paper-tear_0.45s_ease-in_forwards]",
                )}
              >
                <Receipt58 job={p.job} lang={p.lang} />
              </button>
            ))}
          </div>
          {papers.some((p) => p.phase === "done") && (
            <div className="absolute -top-1 left-1/2 z-20 flex -translate-x-1/2 animate-fade-in items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
              <Printer className="size-3.5" /> {locale === "th" ? "แตะกระดาษเพื่ออ่านใบเสร็จ" : "Tap the paper to read it"}
            </div>
          )}
        </div>

        {/* ตัวเครื่อง */}
        <div data-device-body className="relative z-10 rounded-[40px] bg-[linear-gradient(180deg,#3b3e45_0%,#26282d_14%,#1c1d21_100%)] p-3 pb-[34px] pt-[70px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/40">
          {/* ช่องกระดาษ + หัวพิมพ์ */}
          <div className="absolute inset-x-5 top-2.5 h-[50px] rounded-[30px] bg-[linear-gradient(180deg,#45484f,#2b2d33)] shadow-[inset_0_-2px_6px_rgba(0,0,0,0.45)]">
            <div className="absolute left-1/2 top-[7px] h-[5px] w-[292px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]" />
            <div className="absolute bottom-3 left-6 flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", papers.some((p) => p.phase === "printing") ? "animate-pulse bg-amber-400" : "bg-emerald-400")} />
              <span className="text-[9px] font-semibold tracking-[0.2em] text-white/40">58MM THERMAL</span>
            </div>
            <div className="absolute bottom-3 right-6 h-2 w-10 rounded-full bg-black/40" />
          </div>
          <div className="relative overflow-hidden rounded-[20px] bg-black ring-2 ring-black" style={{ width: SCREEN_W, height: SCREEN_H }}>
            {app}
          </div>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="size-1 rounded-full bg-black/60" />
            ))}
          </div>
          <span className="absolute -right-[3px] top-[180px] h-16 w-[4px] rounded-r bg-[#2a2c31]" />
          <span className="absolute -right-[3px] top-[260px] h-10 w-[4px] rounded-r bg-[#2a2c31]" />
        </div>
      </div>
      {viewerModal}
    </div>
  );
}

/** ไม่มีกรอบเครื่อง (จอมือถือ) — กระดาษเลื่อนลงมาเป็นชั้นบนสุดของจอแทน */
function InlinePrinter({ papers, onView, onTear, label }: { papers: Paper[]; onView: (p: Paper) => void; onTear: (id: number) => void; label: { tear: string } }) {
  const current = papers.filter((p) => p.phase !== "tearing").at(-1);
  if (!current) return null;
  return (
    <div className="absolute inset-0 z-[80] flex flex-col items-center bg-slate-950/55 pt-2">
      <div className="h-2 w-[86%] rounded-full bg-black" />
      <div className="relative -mt-1 max-h-[72%] w-[80%] overflow-hidden">
        <button
          type="button"
          onClick={() => current.phase === "done" && onView(current)}
          className={cn("block w-full bg-[#FDFDFB] px-4 pb-6 pt-4 text-left font-receipt text-[11.5px] leading-[1.35] text-black", current.phase === "printing" && "animate-[paper-drop_2.4s_steps(30)_both]")}
        >
          <Receipt58 job={current.job} lang={current.lang} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => onTear(current.id)} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-slate-800 shadow">
          <Scissors className="size-4" /> {label.tear}
        </button>
      </div>
    </div>
  );
}

function ReceiptViewer({ paper, onClose, onTear, label }: { paper: Paper; onClose: () => void; onTear: () => void; label: { tear: string; close: string } }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="close" className="absolute inset-0 animate-fade-in bg-slate-950/70" onClick={onClose} />
      <div className="relative flex max-h-full animate-pop flex-col items-center">
        <div className="thin-scroll max-h-[calc(100dvh-120px)] overflow-y-auto rounded-sm shadow-2xl">
          <div className="w-[300px] bg-[#FDFDFB] px-5 pb-8 pt-5 font-receipt text-[12.5px] leading-[1.4] text-black">
            <Receipt58 job={paper.job} lang={paper.lang} />
          </div>
          <div className="h-3 w-[300px] bg-[linear-gradient(135deg,#FDFDFB_50%,transparent_50%),linear-gradient(225deg,#FDFDFB_50%,transparent_50%)] bg-[length:12px_12px] bg-repeat-x" />
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onTear} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-slate-800 shadow">
            <Scissors className="size-4" /> {label.tear}
          </button>
          <button type="button" onClick={onClose} className="flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-[13px] font-bold text-white shadow">
            <X className="size-4" /> {label.close}
          </button>
        </div>
      </div>
    </div>
  );
}
