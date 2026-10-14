"use client";

// เดโม่ทั้งสองตัวอ่าน/เขียน localStorage และนาฬิกาของเครื่อง จึงเรนเดอร์ฝั่งเบราว์เซอร์อย่างเดียว

import dynamic from "next/dynamic";
import type { HandheldDemoProps } from "@/demo/handheld/HandheldDemo";
import type { WebAdminDemoProps } from "@/demo/webadmin/WebAdminDemo";

function DeviceSkeleton({ label }: { label: string }) {
  return (
    <div className="grid h-full min-h-[420px] w-full place-items-center">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-mute">
        <span className="size-2 animate-pulse rounded-full bg-sapphire-600" /> {label}
      </div>
    </div>
  );
}

const HandheldDemoLazy = dynamic(() => import("@/demo/handheld/HandheldDemo"), {
  ssr: false,
  loading: () => <DeviceSkeleton label="Booting handheld…" />,
});

const WebAdminDemoLazy = dynamic(() => import("@/demo/webadmin/WebAdminDemo"), {
  ssr: false,
  loading: () => <DeviceSkeleton label="Loading web admin…" />,
});

export function HandheldEmbed(props: HandheldDemoProps) {
  return <HandheldDemoLazy {...props} />;
}

export function WebAdminEmbed(props: WebAdminDemoProps) {
  return <WebAdminDemoLazy {...props} />;
}

const ResetButtonLazy = dynamic(() => import("@/demo/ResetButton"), { ssr: false });

export function DemoResetButton(props: { label: string; doneLabel: string }) {
  return <ResetButtonLazy {...props} />;
}
