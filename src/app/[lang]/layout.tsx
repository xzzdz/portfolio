import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Thai, Noto_Sans_Lao, Noto_Sans_Thai, Sarabun } from "next/font/google";
import { profile } from "@/content/profile";
import { hasLocale, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-plex-thai",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});
// ฟอนต์ของเดโม่ — โหลดเมื่อมีตัวอักษรที่ต้องใช้จริงเท่านั้น
const notoThai = Noto_Sans_Thai({ subsets: ["thai", "latin"], variable: "--font-noto-thai", display: "swap", preload: false });
const notoLao = Noto_Sans_Lao({ subsets: ["lao"], variable: "--font-noto-lao", display: "swap", preload: false });
const sarabun = Sarabun({ weight: ["400", "600", "700"], subsets: ["thai", "latin"], variable: "--font-sarabun", display: "swap", preload: false });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "th";
  const title = `${profile.name[l]} — ${profile.role[l]}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${profile.name[l]}` },
    description: profile.tagline[l],
    alternates: { languages: { th: "/th", en: "/en" } },
    openGraph: { title, description: profile.tagline[l], type: "website", locale: l === "th" ? "th_TH" : "en_US", images: [{ url: l === "en" ? "/og-en.png" : "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: profile.tagline[l], images: [l === "en" ? "/og-en.png" : "/og.png"] },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "32x32" }], apple: "/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f5f4f0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  // ภาษาที่ไม่รองรับ (เช่น /fr) ให้แต่ละหน้าเรียก notFound() เอง → แสดง [lang]/not-found.tsx ภายใต้ layout นี้
  const htmlLang = hasLocale(lang) ? lang : "th";
  return (
    <html lang={htmlLang} className={`${plexThai.variable} ${plexMono.variable} ${notoThai.variable} ${notoLao.variable} ${sarabun.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
