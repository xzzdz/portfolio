"use client";

import type { Locale } from "@/lib/i18n";
import { useIsClient, useMediaQuery } from "@/lib/useMedia";
import { HandheldEmbed } from "./DemoEmbeds";

/** เดโม่ Handheld เต็มหน้า : มีกรอบเครื่องบนจอใหญ่ / เต็มจอบนมือถือ */
export function HandheldStage({ locale }: { locale: Locale }) {
  const client = useIsClient();
  const phone = useMediaQuery("(max-width: 480px)");
  if (!client) return null;
  return phone ? (
    <div className="h-[calc(100dvh-56px)] w-full">
      <HandheldEmbed locale={locale} framed={false} />
    </div>
  ) : (
    <HandheldEmbed locale={locale} scale="fit" fitOffset={90} />
  );
}
