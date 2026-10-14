// สร้างชุดข้อมูลตัวอย่างของตลาดหนึ่งแห่ง — สุ่มแบบกำหนด seed ได้ผลเหมือนเดิมทุกครั้ง
// แต่วันที่ทั้งหมดคิดสัมพันธ์กับ "วันนี้" สถานะสัญญา/ใบวางบิลจึงดูสมจริงทุกวันที่เปิดดู

import { addDays, parseISODate, toISODate, toLocalISO } from "@/lib/format";
import type { L } from "@/lib/i18n";
import { fineOf, invoiceAmount } from "../selectors";
import { bankTxnDetail, maskAccount, scoreApproval, senderBanks, slipRef, statementPatterns } from "../verify";
import { prospects, shopsByZone, staffNames } from "./names";
import type {
  ActivityItem,
  Approval,
  Area,
  BankTransaction,
  Channel,
  Contract,
  Customer,
  DemoData,
  Invoice,
  InvoiceItem,
  MaintenanceTicket,
  MeterReading,
  PayMethod,
  PaymentAccount,
  PaymentIntent,
  Receipt,
  StaffUser,
  StatementUpload,
  Zone,
} from "./types";

export const DATA_VERSION = 4;

// ─────────────────────────── ตัวช่วย ───────────────────────────

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function firstOfMonth(iso: string, offsetMonths = 0) {
  const d = parseISODate(iso);
  return toISODate(new Date(d.getFullYear(), d.getMonth() + offsetMonths, 1));
}

function withDay(periodIso: string, day: number) {
  const d = parseISODate(periodIso);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return toISODate(new Date(d.getFullYear(), d.getMonth(), Math.min(day, last)));
}

/** เลขเอกสารแบบ พ.ศ. 2 หลัก + เดือน เช่น IV6910-0007 */
export function docNo(prefix: string, iso: string, seq: number) {
  const d = parseISODate(iso);
  const yy = String(d.getFullYear() + 543).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${prefix}${yy}${mm}-${String(seq).padStart(4, "0")}`;
}

function contractNo(prefix: string, iso: string, seq: number) {
  const yy = String(parseISODate(iso).getFullYear() + 543).slice(2);
  return `${prefix}${yy}-${String(seq).padStart(3, "0")}`;
}

const label = (th: string, en: string): L => ({ th, en });

const UNIT_MONTH = label("เดือน", "month");
const UNIT_DAY = label("วัน", "day");
const UNIT_ITEM = label("รายการ", "item");
const UNIT_WATER = label("หน่วย", "unit");

export const WATER_PRICE = 18;
export const ELECTRIC_PRICE = 8;
export const COMMON_FEE = 200;

type ZonePlan = {
  code: string;
  name: L;
  locks: number;
  cols: number;
  size: number;
  rate: number;
  term: "monthly" | "daily";
  /** index ร้านในโซนที่เช่า 2 ล็อกติดกัน */
  doubleShop?: number;
  plan: Zone["plan"];
  utilities: boolean;
};

const zonePlans: ZonePlan[] = [
  { code: "A", name: label("โซน A ผัก-ผลไม้", "Zone A · Fresh produce"), locks: 16, cols: 8, size: 4, rate: 2200, term: "monthly", doubleShop: 2, plan: { x: 40, y: 40, w: 420, h: 150 }, utilities: true },
  { code: "B", name: label("โซน B อาหารสด", "Zone B · Meat & seafood"), locks: 12, cols: 6, size: 6, rate: 3200, term: "monthly", doubleShop: 4, plan: { x: 500, y: 40, w: 330, h: 150 }, utilities: true },
  { code: "C", name: label("โซน C อาหารปรุงสำเร็จ", "Zone C · Ready-to-eat"), locks: 16, cols: 8, size: 4, rate: 2800, term: "monthly", plan: { x: 40, y: 250, w: 420, h: 150 }, utilities: true },
  { code: "D", name: label("โซน D เสื้อผ้า & ของใช้", "Zone D · Clothing & goods"), locks: 12, cols: 6, size: 6, rate: 3000, term: "monthly", doubleShop: 0, plan: { x: 500, y: 250, w: 330, h: 150 }, utilities: true },
  { code: "E", name: label("โซน E ลานรายวัน", "Zone E · Daily stalls"), locks: 10, cols: 10, size: 9, rate: 120, term: "daily", plan: { x: 40, y: 450, w: 790, h: 96 }, utilities: false },
];

/** ลูกค้าเสนอราคา : [index ใน prospects, โซน, ชนิด] */
const prospectPlan: [number, string, "quote" | "quoteDeposit"][] = [
  [0, "A", "quote"],
  [1, "B", "quoteDeposit"],
  [2, "C", "quote"],
  [3, "E", "quote"],
  [4, "D", "quoteDeposit"],
];

// ─────────────────────────── ตัวสร้างข้อมูล ───────────────────────────

/**
 * @param today วันที่ของชุดข้อมูล (yyyy-MM-dd)
 * @param nowMs เวลาตอนสร้าง — ใช้กับรายการของวันนี้ที่ต้องสัมพันธ์กับ "ตอนนี้" เช่น สลิปที่รอตรวจมาแล้วกี่นาที
 */
export function createSeed(today: string, nowMs = Date.now()): DemoData {
  const rand = mulberry32(20241001);
  const pickInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const chance = (p: number) => rand() < p;
  function shuffle<T>(list: T[]): T[] {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const counters: Record<string, number> = {};
  const nextSeq = (key: string) => (counters[key] = (counters[key] ?? 0) + 1);

  const zones: Zone[] = [];
  const areas: Area[] = [];
  const customers: Customer[] = [];
  const contracts: Contract[] = [];

  const periodNow = firstOfMonth(today);
  const dayOfMonth = parseISODate(today).getDate();

  // ── โซนและล็อก ──
  for (const zp of zonePlans) {
    zones.push({ id: `z-${zp.code}`, code: zp.code, name: zp.name, plan: zp.plan });
    for (let i = 0; i < zp.locks; i++) {
      const n = i + 1;
      areas.push({
        id: `a-${zp.code}${String(n).padStart(2, "0")}`,
        zoneId: `z-${zp.code}`,
        name: `${zp.code}${String(n).padStart(2, "0")}`,
        code: `${zonePlans.indexOf(zp) + 1}${String(n).padStart(2, "0")}`,
        sizeSqm: zp.size,
        rate: zp.rate + (zp.term === "monthly" && n <= 2 ? 300 : 0), // ล็อกหัวมุมแพงกว่า
        term: zp.term,
        maintenance: 0,
        hasWater: zp.utilities && zp.code !== "D",
        hasElectric: zp.utilities,
        slot: { col: i % zp.cols, row: Math.floor(i / zp.cols) },
      });
    }
  }

  // ── จัดผู้เช่าลงล็อก ──
  // สถานะสัญญา : เลือกบางรายเป็นใกล้หมด / หมดสัญญา
  const allShops: { zone: ZonePlan; idx: number }[] = [];
  for (const zp of zonePlans) {
    shopsByZone[zp.code].forEach((_, idx) => allShops.push({ zone: zp, idx }));
  }
  const monthlyShops = allShops.filter((x) => x.zone.term === "monthly");
  const shuffledMonthly = shuffle(monthlyShops);
  const nearExpireSet = new Set(shuffledMonthly.slice(0, 5).map((x) => `${x.zone.code}${x.idx}`));
  const expiredSet = new Set(shuffledMonthly.slice(5, 8).map((x) => `${x.zone.code}${x.idx}`));
  const cancelKey = `${shuffledMonthly[9].zone.code}${shuffledMonthly[9].idx}`;

  for (const zp of zonePlans) {
    const zoneAreas = areas.filter((a) => a.zoneId === `z-${zp.code}`);
    const shops = shopsByZone[zp.code];
    const zoneProspects = prospectPlan.filter((p) => p[1] === zp.code);
    const needed = shops.length + (zp.doubleShop !== undefined ? 1 : 0) + zoneProspects.length;
    // ล็อกว่างกระจายแบบสุ่ม (เว้นสองช่องแรกของโซนไว้ให้มีผู้เช่าเสมอ)
    const vacantCount = zoneAreas.length - needed;
    const vacantSlots = new Set(
      shuffle(zoneAreas.map((_, i) => i).filter((i) => i > 1)).slice(0, vacantCount),
    );
    const usable = zoneAreas.filter((_, i) => !vacantSlots.has(i));
    let cursor = 0;

    shops.forEach((shop, idx) => {
      const key = `${zp.code}${idx}`;
      let end: string;
      if (zp.term === "daily") end = addDays(today, pickInt(120, 300));
      else if (nearExpireSet.has(key)) end = addDays(today, pickInt(4, 26));
      else if (expiredSet.has(key)) end = addDays(today, -pickInt(2, 18));
      else end = addDays(today, pickInt(45, 520));
      const durationMonths = zp.term === "daily" ? 12 : [12, 12, 24, 36][pickInt(0, 3)];
      const startDate = parseISODate(end);
      startDate.setMonth(startDate.getMonth() - durationMonths);
      const start = toISODate(startDate);

      const custSeq = nextSeq("customer");
      const customer: Customer = {
        id: `c-${custSeq}`,
        custNo: `C${String(custSeq).padStart(4, "0")}`,
        name: shop.owner,
        shop: shop.shop,
        phone: `08${pickInt(1, 9)}-${pickInt(100, 999)}-${String(pickInt(0, 9999)).padStart(4, "0")}`,
        email: `${shop.owner.en.split(" ")[0].toLowerCase()}.${custSeq}@mail.demo`,
        idCard: `${pickInt(1, 5)}-${pickInt(1000, 9999)}-${pickInt(10000, 99999)}-${pickInt(10, 99)}-${pickInt(1, 9)}`,
        type: chance(0.12) ? "company" : "person",
        address: label(
          `${pickInt(1, 199)}/${pickInt(1, 30)} ม.${pickInt(1, 12)} ต.${["ช้างเผือก", "สุเทพ", "หนองหอย", "ป่าแดด", "ฟ้าฮ่าม"][pickInt(0, 4)]} อ.เมือง จ.เชียงใหม่`,
          `${pickInt(1, 199)}/${pickInt(1, 30)} Moo ${pickInt(1, 12)}, ${["Chang Phueak", "Suthep", "Nong Hoi", "Pa Daet", "Fa Ham"][pickInt(0, 4)]}, Mueang, Chiang Mai`,
        ),
        since: start,
      };
      customers.push(customer);

      const areaIds = [usable[cursor++].id];
      if (zp.doubleShop === idx) areaIds.push(usable[cursor++].id);

      const rate = areaIds.reduce((sum, id) => sum + (areas.find((a) => a.id === id)?.rate ?? zp.rate), 0);

      contracts.push({
        id: `ct-${contracts.length + 1}`,
        no: contractNo("CT", start, nextSeq(`ct-${parseISODate(start).getFullYear()}`)),
        kind: "contract",
        customerId: customer.id,
        areaIds,
        start,
        end,
        rate,
        term: zp.term,
        deposit: zp.term === "monthly" ? rate * 2 : 1000,
        cancelDate: key === cancelKey ? addDays(today, pickInt(20, 40)) : undefined,
      });
    });

    // ลูกค้าเสนอราคา
    for (const [pIdx, , kind] of zoneProspects) {
      const shop = prospects[pIdx];
      const custSeq = nextSeq("customer");
      customers.push({
        id: `c-${custSeq}`,
        custNo: `C${String(custSeq).padStart(4, "0")}`,
        name: shop.owner,
        shop: shop.shop,
        phone: `09${pickInt(1, 9)}-${pickInt(100, 999)}-${String(pickInt(0, 9999)).padStart(4, "0")}`,
        email: `${shop.owner.en.split(" ")[0].toLowerCase()}.${custSeq}@mail.demo`,
        idCard: `${pickInt(1, 5)}-${pickInt(1000, 9999)}-${pickInt(10000, 99999)}-${pickInt(10, 99)}-${pickInt(1, 9)}`,
        type: "person",
        address: label("อ.เมือง จ.เชียงใหม่", "Mueang, Chiang Mai"),
        since: addDays(today, -pickInt(2, 20)),
      });
      const area = usable[cursor++];
      const start = addDays(today, pickInt(6, 21));
      const endDate = parseISODate(start);
      endDate.setFullYear(endDate.getFullYear() + 1);
      contracts.push({
        id: `ct-${contracts.length + 1}`,
        no: contractNo("QT", today, nextSeq("qt")),
        kind,
        customerId: `c-${custSeq}`,
        areaIds: [area.id],
        start,
        end: toISODate(endDate),
        rate: area.rate,
        term: area.term,
        deposit: kind === "quoteDeposit" ? area.rate : 0,
      });
    }
  }

  // ── บัญชีรับชำระของสาขา ──
  const accounts: PaymentAccount[] = [
    { id: "acc-cash", kind: "cash", bank: "CASH", name: label("เงินสด", "Cash"), accountName: label("เงินสดหน้าร้าน", "Cash at counter"), accountNo: "-" },
    { id: "acc-kbank", kind: "bank", bank: "KBANK", name: label("ธนาคารกสิกรไทย", "Kasikorn Bank"), accountName: label("บจก. สุขใจ พลาซ่า", "Sukjai Plaza Co., Ltd."), accountNo: "123-4-56789-0" },
    { id: "acc-scb", kind: "bank", bank: "SCB", name: label("ธนาคารไทยพาณิชย์", "Siam Commercial Bank"), accountName: label("บจก. สุขใจ พลาซ่า", "Sukjai Plaza Co., Ltd."), accountNo: "456-7-89012-3" },
    { id: "acc-pp", kind: "promptpay", bank: "PROMPTPAY", name: label("พร้อมเพย์", "PromptPay"), accountName: label("บจก. สุขใจ พลาซ่า", "Sukjai Plaza Co., Ltd."), accountNo: "000-000-0000" },
  ];

  // ── มิเตอร์ (ย้อนหลัง 2 รอบ + รอบปัจจุบัน) ──
  const meters: MeterReading[] = [];
  const meterPeriods = [firstOfMonth(today, -2), firstOfMonth(today, -1), periodNow];
  const activeContracts = contracts.filter((c) => c.kind === "contract" && c.term === "monthly");
  const usageOf = new Map<string, number>(); // key = `${period}|${areaId}|${type}`

  for (const contract of activeContracts) {
    for (const areaId of contract.areaIds) {
      const area = areas.find((a) => a.id === areaId)!;
      const types: ("water" | "electric")[] = [];
      if (area.hasWater) types.push("water");
      if (area.hasElectric) types.push("electric");
      for (const type of types) {
        const base = type === "water" ? pickInt(3, 14) : pickInt(45, 240);
        let reading = type === "water" ? pickInt(120, 900) : pickInt(2000, 9000);
        meterPeriods.forEach((period, pIdx) => {
          const isCurrent = pIdx === meterPeriods.length - 1;
          const usage = Math.max(1, Math.round(base * (0.8 + rand() * 0.4)));
          const recorded = !isCurrent || chance(0.58);
          const previous = reading;
          const current = recorded ? previous + usage : null;
          if (current !== null) reading = current;
          usageOf.set(`${period}|${areaId}|${type}`, usage);
          meters.push({
            id: `m-${period.slice(0, 7)}-${areaId}-${type}`,
            areaId,
            contractId: contract.id,
            customerId: contract.customerId,
            type,
            meterNo: `${type === "water" ? "W" : "E"}-${area.code}`,
            period,
            previous,
            current,
            unitPrice: type === "water" ? WATER_PRICE : ELECTRIC_PRICE,
            photo: recorded && chance(0.7),
            recordedAt: recorded ? `${addDays(period, isCurrent ? Math.min(dayOfMonth - 1, pickInt(0, 10)) : pickInt(24, 27))}T${String(pickInt(8, 16)).padStart(2, "0")}:${String(pickInt(0, 59)).padStart(2, "0")}:00` : undefined,
            recordedVia: recorded ? (chance(0.65) ? "handheld" : "web") : undefined,
          });
        });
      }
    }
  }
  // ข้อมูลน่าสงสัย 1 รายการ (กดเลขเกิน) ให้ตัวกรองในเว็บแอดมินมีอะไรให้เจอ
  const suspicious = meters.find((m) => m.period === periodNow && m.current !== null && m.type === "electric");
  if (suspicious && suspicious.current !== null) suspicious.current = suspicious.previous + (suspicious.current - suspicious.previous) * 10;

  // ── ใบวางบิล + ใบเสร็จ ──
  const invoices: Invoice[] = [];
  const receipts: Receipt[] = [];
  const staff: StaffUser[] = staffNames.map((st, i) => ({
    id: `u-${i + 1}`,
    name: st.name,
    role: st.role,
    email: st.email,
    lastSeenMinutes: [0, 4, 11, 52][i],
    device: i === 2 ? "handheld" : "web",
  }));

  const methodOf = (): PayMethod => {
    const r = rand();
    return r < 0.3 ? "cash" : r < 0.62 ? "transfer" : "qr";
  };

  function addReceipt(invoice: Invoice, paidAt: string, method: PayMethod, channel: "web" | "handheld") {
    const subtotal = invoice.items.reduce((s2, it) => s2 + it.amount, 0);
    const total = subtotal - invoice.discount;
    const accountId = method === "cash" ? "acc-cash" : method === "qr" ? "acc-pp" : invoice.accountId;
    const receipt: Receipt = {
      id: `r-${receipts.length + 1}`,
      no: docNo("RE", paidAt, nextSeq(`re-${paidAt.slice(0, 7)}`)),
      invoiceIds: [invoice.id],
      customerId: invoice.customerId,
      paidAt,
      method,
      accountId,
      subtotal,
      discount: invoice.discount,
      fine: 0,
      total,
      channel,
      staff: channel === "handheld" ? staff[2].name.th : staff[chance(0.5) ? 0 : 1].name.th,
      slipAttached: method !== "cash",
    };
    receipts.push(receipt);
    invoice.receiptId = receipt.id;
  }

  const billPeriods = [firstOfMonth(today, -2), firstOfMonth(today, -1), periodNow];
  for (const contract of contracts.filter((c) => c.kind === "contract")) {
    const accountId = chance(0.6) ? "acc-kbank" : "acc-scb";
    if (contract.term === "monthly") {
      billPeriods.forEach((period, pIdx) => {
        if (contract.start > withDay(period, 28)) return; // ยังไม่เริ่มสัญญา
        const items: InvoiceItem[] = [
          { kind: "rent", label: label("ค่าเช่าพื้นที่", "Area rent"), qty: 1, unit: UNIT_MONTH, unitPrice: contract.rate, amount: contract.rate },
          { kind: "common", label: label("ค่าบริการส่วนกลาง", "Common area fee"), qty: 1, unit: UNIT_ITEM, unitPrice: COMMON_FEE, amount: COMMON_FEE },
        ];
        // ค่าน้ำไฟของรอบก่อนหน้า
        const prevPeriod = firstOfMonth(period, -1);
        let water = 0;
        let electric = 0;
        for (const areaId of contract.areaIds) {
          water += usageOf.get(`${prevPeriod}|${areaId}|water`) ?? (areas.find((a) => a.id === areaId)?.hasWater ? pickInt(3, 12) : 0);
          electric += usageOf.get(`${prevPeriod}|${areaId}|electric`) ?? pickInt(40, 200);
        }
        if (water) items.push({ kind: "water", label: label("ค่าน้ำประปา", "Water"), qty: water, unit: UNIT_WATER, unitPrice: WATER_PRICE, amount: water * WATER_PRICE });
        if (electric) items.push({ kind: "electric", label: label("ค่าไฟฟ้า", "Electricity"), qty: electric, unit: UNIT_WATER, unitPrice: ELECTRIC_PRICE, amount: electric * ELECTRIC_PRICE });

        const invoice: Invoice = {
          id: `iv-${invoices.length + 1}`,
          no: docNo("IV", period, nextSeq(`iv-${period.slice(0, 7)}`)),
          contractId: contract.id,
          customerId: contract.customerId,
          areaIds: contract.areaIds,
          period,
          issueDate: withDay(period, 1),
          dueDate: withDay(period, 15),
          items,
          discount: chance(0.08) ? Math.round(contract.rate * 0.05) : 0,
          accountId,
        };
        invoices.push(invoice);

        const isCurrent = pIdx === billPeriods.length - 1;
        const paidProb = isCurrent ? Math.min(0.82, Math.max(0.12, dayOfMonth / 22)) : pIdx === 0 ? 0.97 : 0.88;
        if (chance(paidProb)) {
          const lastDay = isCurrent ? Math.max(1, dayOfMonth - 1) : 20;
          const paidDay = pickInt(1, Math.max(1, Math.min(lastDay, 20)));
          const paidAt = `${withDay(period, paidDay)}T${String(pickInt(7, 17)).padStart(2, "0")}:${String(pickInt(0, 59)).padStart(2, "0")}:00`;
          if (paidAt.slice(0, 10) < today) addReceipt(invoice, paidAt, methodOf(), chance(0.42) ? "handheld" : "web");
        }
      });
    } else {
      // ลานรายวัน : บิลรายวันย้อนหลัง 7 วัน เก็บเงินสดผ่านเครื่อง handheld
      for (let back = 6; back >= 0; back--) {
        const day = addDays(today, -back);
        const invoice: Invoice = {
          id: `iv-${invoices.length + 1}`,
          no: docNo("IV", day, nextSeq(`iv-${day.slice(0, 7)}`)),
          contractId: contract.id,
          customerId: contract.customerId,
          areaIds: contract.areaIds,
          period: firstOfMonth(day),
          issueDate: day,
          dueDate: day,
          items: [{ kind: "rent", label: label("ค่าแผงรายวัน", "Daily stall fee"), qty: 1, unit: UNIT_DAY, unitPrice: contract.rate, amount: contract.rate }],
          discount: 0,
          accountId: "acc-cash",
        };
        invoices.push(invoice);
        if (back > 0 && chance(0.9)) {
          addReceipt(invoice, `${day}T${String(pickInt(9, 15)).padStart(2, "0")}:${String(pickInt(0, 59)).padStart(2, "0")}:00`, chance(0.8) ? "cash" : "qr", "handheld");
        }
      }
    }
  }

  // ── แจ้งซ่อม ──
  const ticketPlan: [string, L, L, MaintenanceTicket["status"]][] = [
    ["A", label("ไฟส่องสว่างดับ", "Light out"), label("หลอดไฟเหนือแผงดับ 2 ดวง", "Two lights above the stall are out"), "inProgress"],
    ["B", label("ท่อน้ำรั่วใต้แผง", "Leaking pipe"), label("น้ำซึมจากข้อต่อท่อใต้เคาน์เตอร์", "Water seeping from a joint under the counter"), "pending"],
    ["C", label("ปลั๊กไฟชำรุด", "Broken outlet"), label("เต้ารับมีรอยไหม้ ใช้งานไม่ได้", "Socket is scorched and unusable"), "done"],
    ["D", label("ผ้าใบหลังคาขาด", "Torn canopy"), label("ผ้าใบด้านหน้าขาดเมื่อพายุเมื่อวาน", "Front canopy torn in yesterday's storm"), "pending"],
  ];
  const tickets: MaintenanceTicket[] = ticketPlan.map(([zone, title, detail, status], i) => {
    const occupied = contracts.filter((c) => c.kind === "contract").flatMap((c) => c.areaIds).filter((id) => id.startsWith(`a-${zone}`));
    const areaId = occupied[(i * 3 + 2) % occupied.length];
    const area = areas.find((a) => a.id === areaId)!;
    if (status !== "done") area.maintenance = status === "inProgress" ? 2 : 1;
    const reported = addDays(today, -pickInt(1, 9));
    return { id: `t-${i + 1}`, areaId, title, detail, status, reportedAt: reported, updatedAt: addDays(reported, status === "pending" ? 0 : pickInt(1, 3)) };
  });

  // ── รายรับย้อนหลังก่อนช่วงที่มีใบเสร็จละเอียด (ใช้วาดกราฟ 12 เดือน) ──
  const revenueHistory = Array.from({ length: 9 }, (_, i) => {
    const period = firstOfMonth(today, -11 + i);
    const month = parseISODate(period).getMonth();
    const seasonal = [1.02, 0.97, 0.93, 1.05, 1.01, 0.96, 0.95, 0.98, 1.0, 1.03, 1.08, 1.12][month];
    const trend = 0.9 + i * 0.012;
    return { period, total: Math.round(146_000 * seasonal * trend + pickInt(-4000, 4000)) };
  });

  // ── กิจกรรมล่าสุด ──
  const activity: ActivityItem[] = receipts
    .slice()
    .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1))
    .slice(0, 8)
    .map((r, i) => {
      const cust = customers.find((c) => c.id === r.customerId)!;
      return {
        id: `act-${i + 1}`,
        at: r.paidAt,
        channel: r.channel,
        actor: r.staff,
        text: label(`รับชำระ ${r.no} · ${cust.shop.th}`, `Payment ${r.no} · ${cust.shop.en}`),
        amount: r.total,
      };
    });

  // ── สลิปที่ผู้เช่าโอนเองแล้วแนบมา (หน้า "ตรวจสอบการชำระเงิน") ──
  // เวลาคิดย้อนจาก "ตอนนี้" ป้าย "รอมาแล้ว x นาที" กับลำดับ แนบสลิป → อัปโหลด Statement จึงสมจริงทุกครั้งที่เปิด
  // (อยู่ท้ายสุดเพื่อไม่ให้ลำดับการสุ่มของข้อมูลส่วนอื่นเปลี่ยน)
  const verification = seedVerification();

  function seedVerification() {
    const ago = (minutes: number) => nowMs - minutes * 60_000;
    const local = (ms: number) => toLocalISO(new Date(ms));
    const accountOf = (id: string) => accounts.find((a) => a.id === id)!;
    const customerOf = (id: string) => customers.find((c) => c.id === id)!;
    const reviewers = [staff[1].name.th, staff[0].name.th];

    // Statement ที่อัปโหลดไว้แล้ว — สลิปที่แนบหลังไฟล์ล่าสุดยังจับคู่ไม่ได้จนกว่าจะอัปโหลดรอบถัดไป
    const uploads: StatementUpload[] = (
      [
        ["acc-kbank", 2 * 1440 + 390],
        ["acc-scb", 1440 + 310],
        ["acc-kbank", 70],
        ["acc-scb", 64],
      ] as [string, number][]
    ).map(([accountId, minutes], i) => {
      const at = new Date(ago(minutes));
      const pattern = statementPatterns.find((pt) => pt.bank === accountOf(accountId).bank)!;
      const stamp = toISODate(at).replaceAll("-", "");
      return {
        id: `up-${i + 1}`,
        at: toLocalISO(at),
        accountId,
        pattern: pattern.id,
        fileName: `${pattern.bank === "KBANK" ? "KBIZ_Statement" : "SCB_BusinessNet"}_${stamp}${pattern.ext}`,
        rows: 0,
        matched: 0,
        by: reviewers[i % 2],
      };
    });
    const uploadFor = (accountId: string, slipAt: string) =>
      uploads.filter((u) => u.accountId === accountId && u.at >= slipAt).sort((a, b) => (a.at < b.at ? -1 : 1))[0];

    type Kind = "ok" | "short" | "noStatement" | "dateUnknown" | "duplicate" | "wrongAccount";
    type Draft = {
      kind: Kind;
      customerId: string;
      accountId: string;
      invoiceIds: string[];
      amount: number;
      fine: number;
      channel: Channel;
      createdMs: number;
      slipMs: number;
      slipAmount: number;
      status: Approval["status"];
      receiptId?: string;
      reviewer?: string;
      reviewedMs?: number;
      note?: string;
    };
    const drafts: Draft[] = [];

    // ประวัติที่อนุมัติไปแล้ว : ใบเสร็จเงินโอนล่าสุด (วันที่รับชำระอิงตามสลิป)
    receipts
      .filter((r) => r.method === "transfer" && Date.parse(r.paidAt) <= ago(4 * 60))
      .sort((a, b) => (a.paidAt < b.paidAt ? -1 : 1))
      .slice(-6)
      .forEach((r, i) => {
        const paidMs = Date.parse(r.paidAt);
        drafts.push({
          kind: "ok",
          customerId: r.customerId,
          accountId: r.accountId,
          invoiceIds: r.invoiceIds,
          amount: r.total,
          fine: r.fine,
          channel: r.channel,
          createdMs: paidMs + 4 * 60_000,
          slipMs: paidMs,
          slipAmount: r.total,
          status: "completed",
          receiptId: r.id,
          reviewer: reviewers[i % 2],
          reviewedMs: Math.min(paidMs + pickInt(35, 150) * 60_000, ago(5)),
        });
      });

    // รายการรอตรวจของตอนนี้ : ผู้เช่าที่ยังค้างบิลรายเดือน
    const owing = new Map<string, Invoice[]>();
    for (const iv of invoices) {
      if (iv.receiptId || iv.issueDate === iv.dueDate || iv.issueDate > today) continue;
      owing.set(iv.customerId, [...(owing.get(iv.customerId) ?? []), iv]);
    }
    const picks = shuffle([...owing.keys()]);
    const plan: [Kind, number, Channel][] = [
      ["wrongAccount", 2 * 1440 + 200, "web"],
      ["duplicate", 1530, "handheld"],
      ["short", 1180, "web"],
      ["ok", 230, "handheld"],
      ["ok", 160, "web"],
      ["ok", 95, "handheld"],
      ["dateUnknown", 48, "web"],
      ["noStatement", 22, "handheld"],
    ];
    plan.forEach(([kind, minutes, channel], i) => {
      const customerId = picks[i];
      if (!customerId) return;
      const list = owing.get(customerId)!.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
      // หนึ่งรายการชำระข้ามธนาคารไม่ได้ — เอาเฉพาะใบที่ออกจากธนาคารเดียวกัน
      const bills = list.filter((iv) => iv.accountId === list[0].accountId);
      const fine = bills.reduce((sum, iv) => sum + fineOf(iv, today), 0);
      const amount = bills.reduce((sum, iv) => sum + invoiceAmount(iv), 0) + fine;
      const createdMs = ago(minutes);
      const rejected = kind === "wrongAccount";
      drafts.push({
        kind,
        customerId,
        accountId: list[0].accountId,
        invoiceIds: bills.map((iv) => iv.id),
        amount,
        fine,
        channel,
        createdMs,
        slipMs: createdMs - 3 * 60_000,
        slipAmount: kind === "short" ? amount - 500 : amount,
        status: rejected ? "rejected" : "pending",
        reviewer: rejected ? reviewers[0] : undefined,
        reviewedMs: rejected ? createdMs + 47 * 60_000 : undefined,
        note: rejected ? "โอนเข้าบัญชีส่วนตัว ไม่ใช่บัญชีของสาขา" : undefined,
      });
    });

    // ออกเลขตามลำดับเวลา
    drafts.sort((a, b) => a.createdMs - b.createdMs);
    const intents: PaymentIntent[] = [];
    const approvals: Approval[] = [];
    const bankTxns: BankTransaction[] = [];
    let firstApproved: Approval | undefined;

    drafts.forEach((dr, i) => {
      const createdAt = local(dr.createdMs);
      const intentAt = local(dr.slipMs - 4 * 60_000);
      const ym = createdAt.slice(0, 7);
      const customer = customerOf(dr.customerId);
      const account = accountOf(dr.accountId);
      // สลิปซ้ำ = ส่งสลิปเก่าที่เคยอนุมัติไปแล้วมาอีกรอบ
      const source = dr.kind === "duplicate" ? firstApproved : undefined;
      const wrong = dr.kind === "wrongAccount";
      const slipNo = docNo("SL", createdAt, nextSeq(`sl-${ym}`));
      let approval: Approval = {
        id: `ap-s${i + 1}`,
        no: docNo("AP", createdAt, nextSeq(`ap-${ym}`)),
        intentId: `pi-s${i + 1}`,
        customerId: dr.customerId,
        accountId: dr.accountId,
        amount: dr.amount,
        slip: source
          ? { ...source.slip, no: slipNo }
          : {
              no: slipNo,
              ref: slipRef(new Date(dr.slipMs), pickInt(1, 9999)),
              at: local(dr.slipMs),
              amount: dr.slipAmount,
              senderName: customer.name,
              senderBank: senderBanks[pickInt(0, senderBanks.length - 1)],
              senderAccount: `xxx-x-x${pickInt(1000, 9999)}-x`,
              receiverName: wrong ? label("นายธนพล ใจดี", "Thanaphon Jaidee") : account.accountName,
              receiverBank: wrong ? "KTB" : account.bank,
              receiverAccount: wrong ? "xxx-x-x5521-x" : maskAccount(account),
            },
        createdAt,
        channel: dr.channel,
        checks: {
          account: wrong ? "mismatch" : "match",
          amount: dr.kind === "short" || source ? "mismatch" : "match",
          date: source ? "mismatch" : dr.kind === "dateUnknown" ? "unknown" : "match",
        },
        confidence: null,
        confidenceStatus: "pending",
        duplicateOf: source?.no,
        status: dr.status,
        reviewedBy: dr.reviewer,
        reviewedAt: dr.reviewedMs ? local(dr.reviewedMs) : undefined,
        note: dr.note,
        receiptId: dr.receiptId,
      };
      const upload = source || wrong ? undefined : uploadFor(dr.accountId, approval.slip.at);
      if (upload) {
        const tx: BankTransaction = { id: `tx-s${i + 1}`, uploadId: upload.id, accountId: dr.accountId, at: approval.slip.at, amount: approval.slip.amount, detail: bankTxnDetail(approval.slip) };
        bankTxns.push(tx);
        upload.matched++;
        // เวลาในรายการเดินบัญชียืนยันวันที่โอนแทนสลิปที่อ่านวันที่ไม่ออก
        approval = { ...approval, bankTxnId: tx.id, checks: { ...approval.checks, date: approval.checks.date === "unknown" ? "match" : approval.checks.date } };
      }
      approval = scoreApproval(approval);
      approvals.push(approval);
      if (dr.status === "completed") firstApproved ??= approval;

      intents.push({
        id: approval.intentId,
        no: docNo("PI", intentAt, nextSeq(`pi-${intentAt.slice(0, 7)}`)),
        invoiceIds: dr.invoiceIds,
        customerId: dr.customerId,
        accountId: dr.accountId,
        amount: dr.amount,
        fine: dr.fine,
        createdAt: intentAt,
        expiresAt: new Date(dr.slipMs + 11 * 60_000).toISOString(),
        status: dr.status === "completed" ? "paid" : dr.status === "rejected" ? "cancelled" : "review",
        channel: dr.channel,
        receiptId: dr.receiptId,
        approvalId: approval.id,
      });
      if (dr.status === "pending") {
        for (const iv of invoices) {
          if (dr.invoiceIds.includes(iv.id)) {
            iv.intentId = approval.intentId;
            iv.approvalId = approval.id;
          }
        }
      }
    });
    uploads.forEach((u) => (u.rows = u.matched + pickInt(18, 36)));

    return { intents: intents.reverse(), approvals: approvals.reverse(), bankTxns, uploads: uploads.reverse() };
  }

  return {
    version: DATA_VERSION,
    seededOn: today,
    today,
    market: {
      name: label("ตลาดสุขใจ พลาซ่า", "Sukjai Plaza Market"),
      branch: label("สาขาเชียงใหม่", "Chiang Mai branch"),
      address: label("99/9 ถ.ห้วยแก้ว ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200", "99/9 Huay Kaew Rd., Suthep, Mueang, Chiang Mai 50200"),
      taxId: "0-5055-6XXXX-XX-X",
      phone: "053-000-000",
      nearExpireDays: 30,
    },
    zones,
    areas,
    customers,
    contracts,
    invoices,
    receipts,
    accounts,
    intents: verification.intents,
    approvals: verification.approvals,
    bankTxns: verification.bankTxns,
    uploads: verification.uploads,
    meters,
    tickets,
    staff,
    activity,
    revenueHistory,
    counters,
  };
}
