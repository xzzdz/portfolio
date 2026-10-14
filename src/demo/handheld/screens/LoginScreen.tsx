"use client";

import { Building2, ChevronDown, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useApp } from "../AppContext";
import { hLanguages } from "../i18n";
import { Flag } from "../ui/Flag";
import { LanguageDialog } from "../ui/Pickers";

export function LoginScreen() {
  const { t, lang, openDialog, login, notify, d, staff } = useApp();
  const [email, setEmail] = useState("teerawat@sukjai.demo");
  const [password, setPassword] = useState("demo1234");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const langInfo = hLanguages.find((l) => l.code === lang)!;

  function submit() {
    if (!email.includes("@")) return notify(t("เข้าสู่ระบบไม่สำเร็จ"), t("กรุณากรอก Email เช่น admin@email.com"), "error");
    if (!password) return notify(t("เข้าสู่ระบบไม่สำเร็จ"), t("กรุณากรอก Password"), "error");
    setLoading(true);
    window.setTimeout(() => {
      login();
      notify(t("เข้าสู่ระบบสำเร็จ"), t("ยินดีต้อนรับ {name}", { name: d(staff) }), "success");
    }, 900);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[linear-gradient(165deg,#0F52BA_0%,#0A3575_45%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute -right-16 -top-10 size-64 rounded-full bg-sky-400/25" />
      <div className="pointer-events-none absolute -left-20 top-56 size-56 rounded-full bg-violet-500/20" />

      <div className="relative flex justify-end px-4 pt-3">
        <button type="button" onClick={() => openDialog(<LanguageDialog />)} className="flex h-8 items-center gap-1 rounded-2xl border border-white/25 bg-white/10 px-2.5 text-[11px] font-bold">
          <Flag lang={lang} size={16} /> {langInfo.short} <ChevronDown className="size-3.5 text-white/60" />
        </button>
      </div>

      <div className="relative mt-8 flex flex-col items-center px-8 text-center">
        <span className="grid size-[76px] place-items-center rounded-[26px] border border-white/30 bg-white/15 shadow-xl">
          <Building2 className="size-10" />
        </span>
        <div className="mt-4 text-[28px] font-extrabold tracking-tight">Chaoperty</div>
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/75">
          Handheld V2 <span className="rounded bg-white/20 px-1.5 py-px text-[9px] font-bold tracking-wider text-white">DEMO</span>
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">{t("ระบบบริหารพื้นที่เช่า สำหรับเครื่อง POS แบบพกพา")}</p>
      </div>

      <div className="relative mx-5 mt-8 rounded-[26px] border border-white/10 bg-white p-5 text-slate-800 shadow-2xl">
        <div className="text-[17px] font-extrabold text-slate-900">{t("เข้าสู่ระบบ")}</div>
        <label className="mt-4 flex h-12 items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-[#0F52BA] focus-within:bg-white">
          <Mail className="size-[18px] text-slate-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" placeholder="Email" />
        </label>
        <label className="mt-3 flex h-12 items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-[#0F52BA] focus-within:bg-white">
          <Lock className="size-[18px] text-slate-400" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            type={show ? "text" : "password"}
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
            placeholder="Password"
          />
          <button type="button" onClick={() => setShow(!show)} className="text-slate-400" aria-label="toggle password">
            {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-[#0F52BA] to-[#002366] text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(15,82,186,0.35)] transition active:scale-[0.98] disabled:opacity-80"
        >
          {loading && <Loader2 className="size-5 animate-spin" />}
          {t("เข้าสู่ระบบ")}
        </button>
        <p className="mt-3 text-center text-[11px] text-slate-400">{t("บัญชีเดโม่กรอกไว้ให้แล้ว กดเข้าสู่ระบบได้เลย")}</p>
      </div>

      <div className="relative mt-auto pb-4 text-center text-[10.5px] text-white/45">Chaoperty Handheld v2.0.0 · Android 7.1 · armeabi-v7a</div>
    </div>
  );
}
