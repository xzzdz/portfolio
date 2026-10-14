"use client";

// "หลังบ้าน" ของเดโม่ทั้งสองตัว — แอป Handheld กับเว็บแอดมินอ่าน/เขียน store เดียวกัน
// เหมือนระบบจริงที่ทั้งสองฝั่งยิง backend ตัวเดียวกัน (ชำระบิลบนเครื่อง → เว็บเห็นทันที)
// เก็บลง localStorage เพื่อให้สลับหน้า/แท็บแล้วข้อมูลยังอยู่

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addDays, toISODate, toLocalISO } from "@/lib/format";
import { createSeed, DATA_VERSION, docNo } from "./data/seed";
import type { Approval, BankTransaction, Channel, DemoData, Invoice, InvoiceItem, MaintenanceTicket, PayMethod, PaymentIntent, Receipt, StatementUpload } from "./data/types";
import { fineOf, invoiceAmount, invoiceSubtotal, isSuspiciousReading } from "./selectors";
import { bankTxnDetail, maskAccount, scoreApproval, senderBanks, SLIP_READ_MS, slipRef } from "./verify";

export const todayISO = () => toISODate(new Date());

/** เวลาท้องถิ่นแบบไม่มี timezone ให้รูปแบบตรงกับข้อมูลตั้งต้น */
export const nowLocalISO = () => toLocalISO(new Date());

type PayInput = {
  invoiceIds: string[];
  method: PayMethod;
  accountId: string;
  channel: Channel;
  staff: string;
  slipAttached?: boolean;
  /** วันที่รับชำระ (ค่าเริ่มต้น = ตอนนี้) — การอนุมัติสลิปใช้วันที่ตามสลิป */
  paidAt?: string;
};

type DemoActions = {
  payInvoices: (input: PayInput) => Receipt;
  createIntent: (input: { invoiceIds: string[]; accountId: string; channel: Channel }) => PaymentIntent;
  completeIntent: (intentId: string, opts: { staff: string; slipAttached: boolean }) => Receipt | null;
  cancelIntent: (intentId: string) => void;
  renewIntent: (intentId: string) => void;
  recordMeter: (meterId: string, value: number, opts: { channel: Channel; photo?: boolean }) => void;
  setTicketStatus: (ticketId: string, status: MaintenanceTicket["status"]) => void;
  /** ผู้เช่าโอนเองแล้วแนบสลิป → รายการไปรอที่หน้า "ตรวจสอบการชำระเงิน" */
  submitSlip: (intentId: string, opts: { channel: Channel }) => Approval | null;
  /** สลิปที่ถึงเวลาอ่านเสร็จแล้ว → ใส่ผลตรวจรายข้อและคะแนน (คืนจำนวนที่เปลี่ยน) */
  settleApprovals: () => number;
  /** อัปโหลด Bank Statement → จับคู่รายการเดินบัญชีกับสลิปที่ยังรอ */
  importStatement: (input: { accountId: string; pattern: string; fileName: string; fileSize: number; staff: string }) => { upload: StatementUpload; matched: string[] };
  /** อนุมัติ → ออกใบเสร็จ (วันที่รับชำระ: ตามสลิป หรือวันที่ที่เลือก) */
  approvePayments: (approvalIds: string[], opts: { staff: string; paidAt?: string }) => Receipt[];
  /** ปฏิเสธ → รายการรอชำระถูกยกเลิก บิลกลับไปค้างชำระ */
  rejectPayment: (approvalId: string, opts: { staff: string; note: string }) => void;
  /** ออกใบวางบิลค่าน้ำ-ไฟจากเลขมิเตอร์รอบนี้ที่จดแล้ว (ข้ามเลขที่น่าสงสัยไว้ให้ตรวจก่อน) */
  billUtilities: () => { created: number; skipped: number };
  reset: () => void;
};

export type DemoState = DemoData & DemoActions;

function nextCounter(counters: Record<string, number>, key: string) {
  const value = (counters[key] ?? 0) + 1;
  return { counters: { ...counters, [key]: value }, value };
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...createSeed(todayISO()),

      payInvoices: ({ invoiceIds, method, accountId, channel, staff, slipAttached, paidAt = nowLocalISO() }) => {
        const state = get();
        const targets = state.invoices.filter((iv) => invoiceIds.includes(iv.id) && !iv.receiptId);
        const subtotal = targets.reduce((sum, iv) => sum + invoiceSubtotal(iv), 0);
        const discount = targets.reduce((sum, iv) => sum + iv.discount, 0);
        const fine = targets.reduce((sum, iv) => sum + fineOf(iv, state.today), 0);
        const { counters, value } = nextCounter(state.counters, `re-${paidAt.slice(0, 7)}`);
        const receipt: Receipt = {
          id: `r-${Date.now()}`,
          no: docNo("RE", paidAt, value),
          invoiceIds: targets.map((iv) => iv.id),
          customerId: targets[0]?.customerId ?? "",
          paidAt,
          method,
          accountId,
          subtotal,
          discount,
          fine,
          total: subtotal - discount + fine,
          channel,
          staff,
          slipAttached: slipAttached ?? method !== "cash",
        };
        const customer = state.customers.find((c) => c.id === receipt.customerId);
        set({
          counters,
          receipts: [...state.receipts, receipt],
          invoices: state.invoices.map((iv) =>
            receipt.invoiceIds.includes(iv.id) ? { ...iv, receiptId: receipt.id, intentId: undefined, approvalId: undefined } : iv,
          ),
          activity: [
            {
              id: `act-${Date.now()}`,
              at: paidAt,
              channel,
              actor: staff,
              text: {
                th: `รับชำระ ${receipt.no} · ${customer?.shop.th ?? ""}`,
                en: `Payment ${receipt.no} · ${customer?.shop.en ?? ""}`,
              },
              amount: receipt.total,
            },
            ...state.activity,
          ].slice(0, 30),
        });
        return receipt;
      },

      createIntent: ({ invoiceIds, accountId, channel }) => {
        const state = get();
        const createdAt = nowLocalISO();
        const targets = state.invoices.filter((iv) => invoiceIds.includes(iv.id));
        const fine = targets.reduce((sum, iv) => sum + fineOf(iv, state.today), 0);
        const amount = targets.reduce((sum, iv) => sum + invoiceAmount(iv), 0) + fine;
        const { counters, value } = nextCounter(state.counters, `pi-${createdAt.slice(0, 7)}`);
        const expires = new Date(Date.now() + 15 * 60_000);
        const intent: PaymentIntent = {
          id: `pi-${Date.now()}`,
          no: docNo("PI", createdAt, value),
          invoiceIds,
          customerId: targets[0]?.customerId ?? "",
          accountId,
          amount,
          fine,
          createdAt,
          expiresAt: expires.toISOString(),
          status: "pending",
          channel,
        };
        set({
          counters,
          intents: [intent, ...state.intents],
          invoices: state.invoices.map((iv) => (invoiceIds.includes(iv.id) ? { ...iv, intentId: intent.id } : iv)),
        });
        return intent;
      },

      completeIntent: (intentId, { staff, slipAttached }) => {
        const state = get();
        const intent = state.intents.find((it) => it.id === intentId);
        if (!intent || intent.status !== "pending") return null;
        const account = state.accounts.find((a) => a.id === intent.accountId);
        const receipt = get().payInvoices({
          invoiceIds: intent.invoiceIds,
          method: account?.kind === "promptpay" ? "qr" : "transfer",
          accountId: intent.accountId,
          channel: intent.channel,
          staff,
          slipAttached,
        });
        set((s) => ({
          intents: s.intents.map((it) => (it.id === intentId ? { ...it, status: "paid", receiptId: receipt.id } : it)),
        }));
        return receipt;
      },

      cancelIntent: (intentId) =>
        set((s) => ({
          intents: s.intents.map((it) => (it.id === intentId ? { ...it, status: "cancelled" } : it)),
          invoices: s.invoices.map((iv) => (iv.intentId === intentId ? { ...iv, intentId: undefined } : iv)),
        })),

      renewIntent: (intentId) =>
        set((s) => ({
          intents: s.intents.map((it) =>
            it.id === intentId ? { ...it, expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() } : it,
          ),
        })),

      recordMeter: (meterId, value, { channel, photo }) =>
        set((s) => ({
          meters: s.meters.map((m) =>
            m.id === meterId
              ? { ...m, current: value, recordedAt: nowLocalISO(), recordedVia: channel, photo: photo ?? m.photo }
              : m,
          ),
        })),

      setTicketStatus: (ticketId, status) =>
        set((s) => {
          const ticket = s.tickets.find((t) => t.id === ticketId);
          return {
            tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: s.today } : t)),
            areas: ticket
              ? s.areas.map((a) =>
                  a.id === ticket.areaId ? { ...a, maintenance: status === "done" ? 0 : status === "inProgress" ? 2 : 1 } : a,
                )
              : s.areas,
          };
        }),

      submitSlip: (intentId, { channel }) => {
        const state = get();
        const intent = state.intents.find((it) => it.id === intentId);
        if (!intent || intent.status !== "pending") return null;
        const customer = state.customers.find((c) => c.id === intent.customerId)!;
        const account = state.accounts.find((a) => a.id === intent.accountId)!;
        const now = Date.now();
        const createdAt = nowLocalISO();
        const ym = createdAt.slice(0, 7);
        const ap = nextCounter(state.counters, `ap-${ym}`);
        const sl = nextCounter(ap.counters, `sl-${ym}`);
        const seq = Math.floor(Math.random() * 10_000);
        const approval: Approval = {
          id: `ap-${now}`,
          no: docNo("AP", createdAt, ap.value),
          intentId,
          customerId: intent.customerId,
          accountId: intent.accountId,
          amount: intent.amount,
          slip: {
            no: docNo("SL", createdAt, sl.value),
            ref: slipRef(new Date(now - 60_000), seq),
            at: toLocalISO(new Date(now - 60_000)),
            amount: intent.amount,
            senderName: customer.name,
            senderBank: senderBanks[seq % senderBanks.length],
            senderAccount: `xxx-x-x${String(1000 + (seq % 9000))}-x`,
            receiverName: account.accountName,
            receiverBank: account.bank,
            receiverAccount: maskAccount(account),
          },
          createdAt,
          channel,
          estimatedAt: new Date(now + SLIP_READ_MS).toISOString(),
          checks: { account: "unknown", amount: "unknown", date: "unknown" },
          confidence: null,
          confidenceStatus: "pending",
          status: "pending",
        };
        set({
          counters: sl.counters,
          approvals: [approval, ...state.approvals],
          intents: state.intents.map((it) => (it.id === intentId ? { ...it, status: "review", approvalId: approval.id } : it)),
          invoices: state.invoices.map((iv) => (intent.invoiceIds.includes(iv.id) ? { ...iv, approvalId: approval.id } : iv)),
        });
        return approval;
      },

      settleApprovals: () => {
        const now = Date.now();
        const due = get().approvals.filter((a) => a.status === "pending" && a.estimatedAt && Date.parse(a.estimatedAt) <= now);
        if (!due.length) return 0;
        const ids = new Set(due.map((a) => a.id));
        set((s) => ({
          approvals: s.approvals.map((a) =>
            ids.has(a.id) ? scoreApproval({ ...a, estimatedAt: undefined, checks: { account: "match", amount: a.slip.amount === a.amount ? "match" : "mismatch", date: "match" } }) : a,
          ),
        }));
        return due.length;
      },

      importStatement: ({ accountId, pattern, fileName, fileSize, staff }) => {
        const state = get();
        const at = nowLocalISO();
        const uploadId = `up-${Date.now()}`;
        // สลิปที่โอนเข้าบัญชีนี้และยังไม่มีรายการเดินบัญชีคู่ (สลิปซ้ำ/โอนผิดบัญชีไม่มีเงินเข้าจริง)
        const targets = state.approvals.filter((a) => a.status === "pending" && a.accountId === accountId && !a.bankTxnId && !a.duplicateOf && a.checks.account !== "mismatch" && a.slip.at <= at);
        const txns: BankTransaction[] = targets.map((a, i) => ({ id: `tx-${Date.now()}-${i}`, uploadId, accountId, at: a.slip.at, amount: a.slip.amount, detail: bankTxnDetail(a.slip) }));
        const txByApproval = new Map(targets.map((a, i) => [a.id, txns[i]]));
        const upload: StatementUpload = {
          id: uploadId,
          at,
          accountId,
          pattern,
          fileName,
          // รายการเดินบัญชีอื่นในไฟล์ (ไม่เกี่ยวกับสลิป) ตามขนาดไฟล์
          rows: targets.length + 12 + Math.min(40, Math.round(fileSize / 2048)),
          matched: targets.length,
          by: staff,
        };
        set({
          bankTxns: [...txns, ...state.bankTxns],
          uploads: [upload, ...state.uploads],
          approvals: state.approvals.map((a) => {
            const tx = txByApproval.get(a.id);
            if (!tx) return a;
            const next: Approval = { ...a, bankTxnId: tx.id, checks: { ...a.checks, date: a.checks.date === "unknown" && !a.estimatedAt ? "match" : a.checks.date } };
            // ยังอ่านสลิปไม่เสร็จ → ผูกรายการเดินบัญชีไว้ก่อน คะแนนจะคิดตอนอ่านเสร็จ
            return a.estimatedAt ? next : scoreApproval(next);
          }),
        });
        return { upload, matched: targets.map((a) => a.id) };
      },

      approvePayments: (approvalIds, { staff, paidAt }) => {
        const receipts: Receipt[] = [];
        for (const id of approvalIds) {
          const state = get();
          const approval = state.approvals.find((a) => a.id === id);
          const intent = approval && state.intents.find((it) => it.id === approval.intentId);
          if (!approval || !intent || approval.status !== "pending") continue;
          const account = state.accounts.find((a) => a.id === approval.accountId);
          const receipt = get().payInvoices({
            invoiceIds: intent.invoiceIds,
            method: account?.kind === "promptpay" ? "qr" : "transfer",
            accountId: approval.accountId,
            channel: intent.channel,
            staff,
            slipAttached: true,
            paidAt: paidAt ?? approval.slip.at,
          });
          receipts.push(receipt);
          const reviewedAt = nowLocalISO();
          set((s) => ({
            approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: "completed", reviewedBy: staff, reviewedAt, receiptId: receipt.id, estimatedAt: undefined } : a)),
            intents: s.intents.map((it) => (it.id === intent.id ? { ...it, status: "paid", receiptId: receipt.id } : it)),
          }));
        }
        return receipts;
      },

      rejectPayment: (approvalId, { staff, note }) =>
        set((s) => {
          const approval = s.approvals.find((a) => a.id === approvalId);
          if (!approval || approval.status !== "pending") return {};
          return {
            approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: "rejected", reviewedBy: staff, reviewedAt: nowLocalISO(), note, estimatedAt: undefined } : a)),
            intents: s.intents.map((it) => (it.id === approval.intentId ? { ...it, status: "cancelled" } : it)),
            invoices: s.invoices.map((iv) => (iv.approvalId === approvalId ? { ...iv, intentId: undefined, approvalId: undefined } : iv)),
          };
        }),

      billUtilities: () => {
        const state = get();
        const period = `${state.today.slice(0, 7)}-01`;
        const recorded = state.meters.filter((m) => m.period === period && m.current !== null && !m.billed);
        const ready = recorded.filter((m) => !isSuspiciousReading(m));
        const skipped = recorded.length - ready.length;
        if (!ready.length) return { created: 0, skipped };
        const byContract = new Map<string, typeof ready>();
        ready.forEach((m) => byContract.set(m.contractId, [...(byContract.get(m.contractId) ?? []), m]));
        let counters = state.counters;
        const created: Invoice[] = [];
        byContract.forEach((list, contractId) => {
          const contract = state.contracts.find((c) => c.id === contractId);
          if (!contract) return;
          const items: InvoiceItem[] = (["water", "electric"] as const).flatMap((type) => {
            const ms = list.filter((m) => m.type === type);
            if (!ms.length) return [];
            const qty = ms.reduce((sum, m) => sum + ((m.current ?? m.previous) - m.previous), 0);
            const unitPrice = ms[0].unitPrice;
            return [
              {
                kind: type,
                label: type === "water" ? { th: "ค่าน้ำประปา", en: "Water" } : { th: "ค่าไฟฟ้า", en: "Electricity" },
                qty,
                unit: { th: "หน่วย", en: "unit" },
                unitPrice,
                amount: qty * unitPrice,
              },
            ];
          });
          const next = nextCounter(counters, `iv-${state.today.slice(0, 7)}`);
          counters = next.counters;
          const lastInvoice = [...state.invoices].reverse().find((iv) => iv.contractId === contractId);
          created.push({
            id: `iv-u-${Date.now()}-${contractId}`,
            no: docNo("IV", state.today, next.value),
            contractId,
            customerId: contract.customerId,
            areaIds: contract.areaIds,
            period,
            issueDate: state.today,
            dueDate: addDays(state.today, 7),
            items,
            discount: 0,
            accountId: lastInvoice?.accountId ?? "acc-kbank",
          });
        });
        set({
          counters,
          invoices: [...state.invoices, ...created],
          meters: state.meters.map((m) => (ready.includes(m) ? { ...m, billed: true } : m)),
        });
        return { created: created.length, skipped };
      },

      reset: () => set({ ...createSeed(todayISO()) }),
    }),
    {
      name: "chaoperty-demo",
      version: DATA_VERSION,
      storage: createJSONStorage(() => localStorage),
      // ชุดข้อมูลของเมื่อวาน → สร้างใหม่ วันที่ครบกำหนด/ใกล้หมดสัญญาจะได้สัมพันธ์กับวันนี้
      merge: (persisted, current) => {
        const saved = persisted as Partial<DemoData> | undefined;
        if (!saved || saved.seededOn !== todayISO() || saved.version !== DATA_VERSION) return current;
        return { ...current, ...saved };
      },
      migrate: () => createSeed(todayISO()) as unknown as DemoState,
    },
  ),
);

if (typeof window !== "undefined") {
  // อีกแท็บเขียนข้อมูล (เช่นเปิดเดโม่สองตัวคนละแท็บ) → โหลดตาม
  window.addEventListener("storage", (event) => {
    if (event.key === "chaoperty-demo") void useDemoStore.persist.rehydrate();
  });
}

/** วันที่ที่ใช้คิดสถานะ — ถ้าเปิดค้างข้ามคืนก็ยังใช้ชุดข้อมูลเดิมไปก่อน */
export const useToday = () => useDemoStore((s) => s.today);

