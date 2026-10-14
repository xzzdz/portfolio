import { LocaleRedirect } from "@/components/site/LocaleRedirect";

export default function RootPage() {
  return (
    <>
      {/* ไม่มี JavaScript ก็ยังไปหน้าไทยได้ */}
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/th" />
      </noscript>
      <LocaleRedirect />
    </>
  );
}
