# CLAUDE.local.md — Ortho Cost Smart

## Project Overview
ระบบคำนวณค่าใช้จ่ายส่วนเกินอุปกรณ์การแพทย์ และพิมพ์ใบยินยอมผู้ป่วย
สำหรับแผนกศัลยกรรมกระดูกและข้อ โรงพยาบาลหัวหิน

**URL:** https://ortho-cost-smart.vercel.app

---

## What It Does
1. **Splash Screen** — เปิดแอพมีโลโก้ + spinner 2 วินาที
2. **กรอกข้อมูลผู้ป่วย** — วันที่ / ชื่อ / อายุ / HN / AN / สิทธิ์ / วินิจฉัยโรค
3. **เลือกวัสดุ/อุปกรณ์** — ค้นหาหรือกด "ดูทั้งหมด" เลื่อนหารายการได้
4. **คำนวณส่วนเกินอัตโนมัติ** — ราคา × จำนวน − วงเงินเบิก = ส่วนที่คนไข้จ่ายเอง
5. **แก้ไขยอดรวมได้** — เผื่อสำรองกรณีเปลี่ยนอุปกรณ์ขณะผ่าตัด
6. **พิมพ์ใบยินยอม A4** — format รพ.หัวหิน พร้อมโลโก้ รพ. + ช่องเซ็น 4 ช่อง
7. **บันทึก log อัตโนมัติ** — ทุกครั้งที่กด print บันทึกลง Google Sheet sheet "บันทึก"
8. **หน้าประวัติ** — ดู / ค้นหา / sort / ลบทีละรายการ / รีเฟรช

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS + Google Fonts Sarabun |
| Backend | Vercel Serverless Functions (`/api/*.js`) |
| Database | Google Sheets (CSV + Sheets API) |
| Auth | Google Service Account (hardcoded JSON key) |
| Hosting | Vercel |
| Repo | GitHub — OadyTT/ortho-cost-smart |

---

## Project Structure

```
ortho-cost-smart/
├── api/
│   ├── items.js    ← GET    อ่านวัสดุจาก sheet "ราคาที่เบิกได้" (CSV)
│   ├── save.js     ← POST   บันทึกคนไข้ลง sheet "บันทึก"
│   ├── history.js  ← GET    ดึงประวัติ (reverse order = ล่าสุดก่อน)
│   └── delete.js   ← DELETE ลบ row ตาม { rowIndex }
├── public/
│   └── logo.png    ← Ortho logo (favicon + PWA icon)
├── src/
│   ├── App.jsx     ← UI ทั้งหมด + logos ฝัง base64
│   ├── App.css     ← Styles + Splash + Print A4
│   └── main.jsx
├── index.html      ← PWA meta (apple-touch-icon, theme-color #1d4ed8)
└── package.json
```

---

## Google Sheets

**Spreadsheet ID:** `1IivnEuLFzonKTpC8WDMkCegUnTLde4JSwKYvwU0YJeU`

| Sheet | วิธีเข้าถึง | บทบาท |
|---|---|---|
| `ราคาที่เบิกได้` | CSV (read) | รายการวัสดุ + วงเงินตามสิทธิ์ |
| `บันทึก` | Sheets API (r/w/delete) | log คนไข้ทุกราย |

**Columns ราคาที่เบิกได้:** `[0]`รหัส `[1]`ชื่อ `[2]`A2 `[3]`UC `[7]`A7 `[9]`ไร้สถานะ

**Columns บันทึก (A–I):** วันที่/เวลา, ชื่อ, อายุ, HN, AN, สิทธิ์, วินิจฉัย, รายการวัสดุ, ส่วนเกินรวม

---

## API Endpoints

| Method | Path | หน้าที่ |
|---|---|---|
| GET | `/api/items` | ดึงรายการวัสดุ |
| POST | `/api/save` | บันทึกคนไข้ |
| GET | `/api/history` | ดึงประวัติทั้งหมด |
| DELETE | `/api/delete` | ลบ row `{ rowIndex }` |

---

## Business Logic

```
ส่วนเกินต่อรายการ = max(0, unitPrice × qty − reimbursable)
reimbursable       = item[right_id]  ← จาก Sheet ตามสิทธิ์ที่เลือก
ยอดรวมแสดง        = editedTotal ?? autoTotal  (แก้ไขได้ก่อน print)
```

---

## Logos

| โลโก้ | ใช้ที่ | เก็บใน |
|---|---|---|
| Ortho Cost Smart | Splash / Header / Favicon / PWA | `public/logo.png` + `ORTHO_LOGO` (base64) |
| โรงพยาบาลหัวหิน | Print A4 เท่านั้น | `HOSP_LOGO` (base64) |

---

## Environment Variables

| Variable | ไฟล์ | ค่า |
|---|---|---|
| `SHEET_CSV_URL` | `api/items.js` | Google Sheet CSV URL |

**Service Account:** `ortho-sheet-writer@ortho-cost-smart.iam.gserviceaccount.com`

> ⚠️ private_key hardcoded — ถ้า production จริงให้ย้ายไป Vercel Env Vars

---

## Known Constraints
- Logo ฝัง base64 → App.jsx ใหญ่ ~160KB แต่ไม่ต้องพึ่ง static server
- History reversed ใน api/history.js → delete ต้องแปลง index กลับ (`originalIdx = length - 1 - realIdx`)
- Print ไม่จำกัดรายการ แต่ถ้าเกิน 1 หน้า A4 ต้องปรับ print CSS
