"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { L, Locale } from "@/lib/i18n";
import { adminData, adminTranslate } from "./i18n";

export type AdminPage = "home" | "area" | "tenant" | "account" | "verify" | "manage" | "report" | "registry" | "setting";
export type ToastType = "success" | "info" | "warning" | "error";
type Toast = { id: number; text: string; type: ToastType };

type Ctx = {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: (th: string, vars?: Record<string, string | number>) => string;
  d: (text: L) => string;
  page: AdminPage;
  params: Record<string, string>;
  go: (page: AdminPage, params?: Record<string, string>) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  toasts: Toast[];
  toast: (text: string, type?: ToastType) => void;
  drawer: ReactNode | null;
  openDrawer: (node: ReactNode) => void;
  closeDrawer: () => void;
  modal: { node: ReactNode; wide?: boolean; xl?: boolean } | null;
  openModal: (node: ReactNode, opts?: { wide?: boolean; xl?: boolean }) => void;
  closeModal: () => void;
  staff: L;
};

const AdminCtx = createContext<Ctx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

export const ADMIN_STAFF: L = { th: "มะลิ วงศ์คำ", en: "Mali Wongkham" };

export function AdminProvider({ children, initialLang, initialPage = "home" }: { children: ReactNode; initialLang: Locale; initialPage?: AdminPage }) {
  const [lang, setLang] = useState<Locale>(initialLang);
  const [page, setPage] = useState<AdminPage>(initialPage);
  const [params, setParams] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [drawer, setDrawer] = useState<ReactNode | null>(null);
  const [modal, setModal] = useState<{ node: ReactNode; wide?: boolean; xl?: boolean } | null>(null);
  const seq = useRef(0);

  const t = useCallback((th: string, vars?: Record<string, string | number>) => adminTranslate(lang, th, vars), [lang]);
  const d = useCallback((text: L) => adminData(lang, text), [lang]);

  const go = useCallback((next: AdminPage, nextParams: Record<string, string> = {}) => {
    setDrawer(null);
    setModal(null);
    setPage(next);
    setParams(nextParams);
  }, []);

  const toast = useCallback((text: string, type: ToastType = "success") => {
    const id = ++seq.current;
    setToasts((list) => [...list.slice(-2), { id, text, type }]);
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3200);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t,
      d,
      page,
      params,
      go,
      sidebarOpen,
      toggleSidebar: () => setSidebarOpen((v) => !v),
      toasts,
      toast,
      drawer,
      openDrawer: setDrawer,
      closeDrawer: () => setDrawer(null),
      modal,
      openModal: (node, opts) => setModal({ node, wide: opts?.wide, xl: opts?.xl }),
      closeModal: () => setModal(null),
      staff: ADMIN_STAFF,
    }),
    [lang, t, d, page, params, go, sidebarOpen, toasts, toast, drawer, modal],
  );

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}
