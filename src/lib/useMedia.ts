"use client";

import { useSyncExternalStore } from "react";

/** อ่าน media query แบบปลอดภัยกับ SSR — ฝั่งเซิร์ฟเวอร์ได้ค่า `serverValue` */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

const noop = () => () => {};

/** true เมื่อเรนเดอร์ในเบราว์เซอร์แล้ว (หลัง hydrate) */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
