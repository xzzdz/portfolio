import type { BankCode } from "../data/types";
import { bankStyle } from "./status";

/** โลโก้ธนาคารแบบวงกลม — ใช้ตัวย่อ+สีประจำธนาคารแทนรูปโลโก้ */
export function BankLogo({ bank, size = 36 }: { bank: BankCode; size?: number }) {
  const style = bankStyle[bank] ?? bankStyle.CASH;
  const fontSize = style.short.length > 2 ? size * 0.3 : size * 0.42;
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight shadow-sm ring-2 ring-white"
      style={{ width: size, height: size, background: style.bg, color: style.fg, fontSize }}
    >
      {style.short}
    </span>
  );
}
