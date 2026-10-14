"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { L } from "@/lib/i18n";
import { dataText, translate, type HLang } from "./i18n";
import type { NotifyType, PrintJob, Route, RouteParams, ScreenName, ThemeId } from "./types";

export type Notice = { id: number; title: string; message?: string; type: NotifyType };
export type SheetOptions = { tall?: boolean; onClose?: () => void };
type SheetEntry = { id: number; node: ReactNode; options: SheetOptions };
export type ScanItem = { code: string; areaId: string };

type AppCtx = {
  lang: HLang;
  setLang: (lang: HLang) => void;
  t: (th: string, vars?: Record<string, string | number>) => string;
  d: (text: L) => string;

  route: Route;
  depth: number;
  go: (name: ScreenName, params?: RouteParams) => void;
  root: (name: ScreenName, params?: RouteParams) => void;
  back: () => void;
  /** ออกจากหน้าปัจจุบันจริงๆ (ปิดชีต/ไดอะล็อกทั้งหมดด้วย) — ใช้หลังทำรายการเสร็จ */
  pop: () => void;

  sheets: SheetEntry[];
  openSheet: (node: ReactNode, options?: SheetOptions) => void;
  closeSheet: () => void;
  dialog: ReactNode | null;
  openDialog: (node: ReactNode) => void;
  closeDialog: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  notices: Notice[];
  notify: (title: string, message?: string, type?: NotifyType) => void;
  dismissNotice: (id: number) => void;

  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  scan: ScanItem | null;
  setScan: (scan: ScanItem | null) => void;

  print: (job: PrintJob) => void;
  staff: L;
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

type ProviderProps = {
  children: ReactNode;
  initialLang: HLang;
  initialScreen?: ScreenName;
  initialParams?: RouteParams;
  startLoggedIn?: boolean;
  onPrint: (job: PrintJob, lang: HLang) => void;
};

export const STAFF: L = { th: "ธีรวัฒน์ ทองมา", en: "Teerawat Thongma" };

export function AppProvider({ children, initialLang, initialScreen, initialParams, startLoggedIn, onPrint }: ProviderProps) {
  const keyRef = useRef(1);
  const nextKey = () => ++keyRef.current;

  const [lang, setLang] = useState<HLang>(initialLang);
  const [loggedIn, setLoggedIn] = useState(startLoggedIn ?? true);
  const [stack, setStack] = useState<Route[]>(() => {
    const home: Route = { name: "home", params: {}, key: 1 };
    if (!(startLoggedIn ?? true)) return [{ name: "login", params: {}, key: 1 }];
    if (!initialScreen || initialScreen === "home") return [home];
    return [home, { name: initialScreen, params: initialParams ?? {}, key: 2 }];
  });
  const [sheets, setSheets] = useState<SheetEntry[]>([]);
  const [dialog, setDialog] = useState<ReactNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [theme, setTheme] = useState<ThemeId>("aurora");
  const [scan, setScan] = useState<ScanItem | null>(null);

  const t = useCallback((th: string, vars?: Record<string, string | number>) => translate(lang, th, vars), [lang]);
  const d = useCallback((text: L) => dataText(lang, text), [lang]);

  const go = useCallback((name: ScreenName, params: RouteParams = {}) => {
    setDrawerOpen(false);
    setStack((s) => [...s, { name, params, key: nextKey() }]);
  }, []);

  const root = useCallback((name: ScreenName, params: RouteParams = {}) => {
    setDrawerOpen(false);
    setSheets([]);
    setStack(() => {
      const home: Route = { name: "home", params: {}, key: nextKey() };
      return name === "home" ? [home] : [home, { name, params, key: nextKey() }];
    });
  }, []);

  const sheetsRef = useRef<SheetEntry[]>([]);
  useEffect(() => {
    sheetsRef.current = sheets;
  }, [sheets]);

  const closeSheet = useCallback(() => {
    const list = sheetsRef.current;
    list[list.length - 1]?.options.onClose?.();
    setSheets((s) => s.slice(0, -1));
  }, []);

  const back = useCallback(() => {
    if (dialog) return setDialog(null);
    if (sheets.length) return closeSheet();
    if (drawerOpen) return setDrawerOpen(false);
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, [dialog, sheets.length, drawerOpen, closeSheet]);

  const pop = useCallback(() => {
    setDialog(null);
    setSheets([]);
    setDrawerOpen(false);
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const openSheet = useCallback((node: ReactNode, options: SheetOptions = {}) => {
    setSheets((s) => [...s, { id: nextKey(), node, options }]);
  }, []);

  const notify = useCallback((title: string, message?: string, type: NotifyType = "success") => {
    const id = nextKey();
    setNotices((list) => [...list.slice(-1), { id, title, message, type }]);
    window.setTimeout(() => setNotices((list) => list.filter((n) => n.id !== id)), 2800);
  }, []);

  const dismissNotice = useCallback((id: number) => setNotices((list) => list.filter((n) => n.id !== id)), []);

  const print = useCallback((job: PrintJob) => onPrint(job, lang), [onPrint, lang]);

  const login = useCallback(() => {
    setLoggedIn(true);
    setStack([{ name: "home", params: {}, key: nextKey() }]);
  }, []);

  const logout = useCallback(() => {
    setLoggedIn(false);
    setDrawerOpen(false);
    setSheets([]);
    setScan(null);
    setStack([{ name: "login", params: {}, key: nextKey() }]);
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      lang,
      setLang,
      t,
      d,
      route: stack[stack.length - 1],
      depth: stack.length,
      go,
      root,
      back,
      pop,
      sheets,
      openSheet,
      closeSheet,
      dialog,
      openDialog: setDialog,
      closeDialog: () => setDialog(null),
      drawerOpen,
      setDrawerOpen,
      notices,
      notify,
      dismissNotice,
      theme,
      setTheme,
      scan,
      setScan,
      print,
      staff: STAFF,
      loggedIn,
      login,
      logout,
    }),
    [lang, t, d, stack, go, root, back, pop, sheets, openSheet, closeSheet, dialog, drawerOpen, notices, notify, dismissNotice, theme, scan, print, loggedIn, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
