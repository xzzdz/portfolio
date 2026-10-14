# Portfolio — Flutter & Web Developer

เว็บ portfolio สองภาษา (ไทย / English) พร้อมเดโม่ที่กดใช้งานได้จริงของสองโปรเจคใน Chaoperty

| หน้า | URL |
|---|---|
| หน้าแรก | `/th` · `/en` (หน้า `/` ส่งต่อตามภาษาเบราว์เซอร์) |
| เคสสตัดี้ Handheld | `/th/projects/chaoperty-handheld` |
| เคสสตัดี้ Web Admin | `/th/projects/chaoperty-web-admin` |
| เดโม่สองระบบคู่กัน | `/th/demo` |
| เดโม่เต็มจอ | `/th/demo/handheld` · `/th/demo/web-admin` |
| Resume (A4) | `/th/resume` · ไฟล์ `public/resume-th.pdf`, `public/resume-en.pdf` |

## เริ่มต้น

```bash
npm install
npm run dev          # http://localhost:3000
```

ต้องใช้ Node.js 20.9 ขึ้นไป

## แก้ข้อมูลส่วนตัว (สำคัญ — ทำก่อนเผยแพร่)

ข้อมูลทั้งหมดอยู่ใน `src/content/` แก้ที่เดียว หน้าเว็บและ Resume เปลี่ยนตาม

| ไฟล์ | มีอะไร |
|---|---|
| `profile.ts` | ชื่อ (ไทย/อังกฤษ), อีเมล, เบอร์โทร, GitHub, โดเมนที่ deploy (`siteUrl` — ตอนนี้ `https://kittikorn.vercel.app`) — ถ้าเว้น `siteUrl` ว่าง Resume จะไม่พิมพ์ QR/ลิงก์ผลงาน |
| `site.ts` | ข้อความหน้าแรก, ทักษะ, ประสบการณ์ (`experience.position`), การศึกษา |
| `projects.ts` | เนื้อหาเคสสตัดี้ทั้งสองโปรเจค |
| `resume.ts` | เนื้อหาเวอร์ชันสั้นสำหรับ Resume หน้าเดียว |

แก้เสร็จแล้วสร้างไฟล์ใหม่ (ต้องเปิด `npm run dev` ไว้ก่อน) :

```bash
npm run resume       # → public/resume-th.pdf, public/resume-en.pdf
npm run shots        # → public/shots/*.webp, public/og.png, public/og-en.png (เมื่อหน้าตาเดโม่หรือชื่อเปลี่ยน)
```

ทั้งสองสคริปต์ใช้ Chrome ที่ติดตั้งในเครื่อง ถ้า dev server ไม่ได้อยู่ที่พอร์ต 3000 ให้ระบุ `BASE=http://localhost:3100`

Resume ล็อกไว้ที่ A4 หนึ่งหน้า ส่วนที่ยาวเกินจะถูกตัดทิ้ง `npm run resume` จึงเช็คให้ทุกครั้ง ถ้าขึ้น `⚠ เนื้อหาเกิน A4` ให้ตัดข้อความใน `resume.ts` ให้สั้นลง (ตอนนี้มี QR แล้วยังพอดีหน้าเดียว)

## Deploy (Vercel)

1. push repo ขึ้น GitHub
2. ไปที่ [vercel.com/new](https://vercel.com/new) → Import repo นี้ → Vercel รู้เองว่าเป็น Next.js ไม่ต้องตั้ง build command หรือ env ใด ๆ → Deploy
3. ได้โดเมนแล้ว (เช่น `https://<ชื่อโปรเจค>.vercel.app` หรือโดเมนของตัวเอง) ให้ใส่ใน `siteUrl` ของ `profile.ts`
4. `npm run dev` แล้ว `npm run resume` ใหม่ → Resume จะมี QR และชื่อโปรเจคกดเป็นลิงก์ไปเคสสตัดี้ได้
5. commit + push → Vercel deploy ใหม่ให้เอง

ระหว่างที่ `siteUrl` ยังว่าง metadata, `sitemap.xml` และ `robots.txt` จะใช้ URL production ที่ Vercel ตั้งให้ตอน build (`VERCEL_PROJECT_PRODUCTION_URL`) อยู่แล้ว ภาพทั้งหมดเป็นไฟล์ที่บีบอัดมาแล้ว (`images.unoptimized`) จึงไม่ใช้โควตา Image Optimization ของ Vercel

## โครงสร้าง

```
src/
├── app/
│   ├── (root)/              หน้า "/" — ส่งต่อไป /th หรือ /en
│   ├── [lang]/              root layout + ทุกหน้า (ไทย/อังกฤษ prerender เป็น static)
│   │   ├── projects/        เคสสตัดี้สองหน้า
│   │   ├── demo/            เดโม่คู่กัน + เต็มจอ
│   │   ├── resume/          Resume A4
│   │   └── shots/[kind]/    หน้าสำหรับถ่ายภาพประกอบ (ไม่ได้ลิงก์จากที่ไหน)
│   └── global-not-found.tsx
├── content/                 ข้อความทั้งหมดของเว็บ (แก้ที่นี่)
├── components/site/         ส่วนประกอบของหน้าเว็บ
├── components/demo/         ตัวโหลดเดโม่ (เรนเดอร์ฝั่งเบราว์เซอร์อย่างเดียว)
└── demo/
    ├── data/                ชุดข้อมูลตลาดตัวอย่าง (ผูกวันที่กับ "วันนี้")
    ├── store.ts             zustand + localStorage — ทั้งสองเดโม่ใช้ store เดียวกัน
    ├── selectors.ts         สถานะพื้นที่ / ใบวางบิล / ค่าปรับ
    ├── handheld/            แอป Handheld (จอ 360×720 dp ในกรอบเครื่อง + หัวพิมพ์ 58 mm)
    └── webadmin/            เว็บแอดมิน (กรอบเบราว์เซอร์ ย่อด้วย CSS zoom)
```

- เดโม่ทั้งสองตัวอ่าน/เขียน store เดียวกัน ชำระบิลบนเครื่อง Handheld แล้วยอดบนหน้าหลักของเว็บแอดมินเปลี่ยนทันที (เปิดคนละแท็บก็ซิงก์ผ่าน `storage` event)
- ข้อมูลสร้างใหม่ทุกวันให้วันครบกำหนด/ใกล้หมดสัญญาสัมพันธ์กับวันที่เปิดดู ปุ่ม "รีเซ็ตข้อมูลเดโม่" อยู่ที่หน้า `/demo` และเมนูตั้งค่าของเว็บแอดมิน
- ภาษาในแอป Handheld : ไทย / English / 中文 / ລາວ (`src/demo/handheld/dict.ts`, คีย์เป็นข้อความไทย) เว็บแอดมิน : ไทย / English (`src/demo/webadmin/dict.ts`)
- QR พร้อมเพย์ประกอบตามมาตรฐาน EMVCo + CRC-16 (`src/lib/promptpay.ts`) โดยใช้เลขปลายทาง `0000000000` ซึ่งไม่ใช่บัญชีจริง

## คำสั่งอื่น

```bash
npm run lint
npm run typecheck
npm run build
```

Built with Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · zustand · lucide-react · qrcode.react
