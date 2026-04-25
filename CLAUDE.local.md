# CLAUDE.local.md — Ortho Cost Smart

## Project Overview
ระบบคำนวณค่าใช้จ่ายส่วนเกินอุปกรณ์การแพทย์ และพิมพ์ใบยินยอมผู้ป่วย
สำหรับแผนกศัลยกรรมกระดูกและข้อ โรงพยาบาลหัวหิน

---

## What It Does
1. **กรอกข้อมูลผู้ป่วย** — วันที่ / ชื่อ / อายุ / HN / AN / สิทธิ์การรักษา / วินิจฉัยโรค
2. **เลือกวัสดุ/อุปกรณ์** — ค้นหาหรือเลื่อนดูรายการทั้งหมดจาก Google Sheet
3. **คำนวณส่วนเกินอัตโนมัติ** — ราคาวัสดุ − วงเงินเบิกได้ตามสิทธิ์ = ส่วนที่คนไข้จ่ายเอง
4. **แก้ไขยอดรวมได้** — เผื่อสำรองกรณีเปลี่ยนอุปกรณ์ขณะผ่าตัด
5. **พิมพ์ใบยินยอม A4** — format โรงพยาบาลหัวหิน พร้อมช่องเซ็น 4 ช่อง
6. **บันทึก log อัตโนมัติ** — ทุกครั้งที่กด print จะ save ลง Google Sheet sheet `บันทึก`
7. **หน้าประวัติ** — ดูและค้นหาประวัติคนไข้ทั้งหมดในแอพ

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS (no framework) + Google Fonts Sarabun |
| Backend API | Vercel Serverless Functions (`/api/*.js`) |
| Database | Google Sheets (Publish as CSV + Sheets API) |
| Auth | Google Service Account (JSON key) |
| Hosting | Vercel |
| Version Control | GitHub |

---

## Project Structure

```
ortho-cost-smart/
├── api/
│   ├── items.js      ← GET  อ่านวัสดุจาก "ราคาที่เบิกได้" sheet (CSV)
│   ├── save.js       ← POST บันทึกข้อมูลคนไข้ลง "บันทึก" sheet
│   └── history.js   ← GET  ดึงประวัติจาก "บันทึก" sheet
├── src/
│   ├── main.jsx      ← React entry point
│   ├── App.jsx       ← UI ทั้งหมด (form + item search + print + history)
│   └── App.css       ← Styles + Splash screen + Print A4 media query
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Google Sheets

**Spreadsheet ID:** `1IivnEuLFzonKTpC8WDMkCegUnTLde4JSwKYvwU0YJeU`

| Sheet | ใช้ทำอะไร | วิธีอ่าน |
|---|---|---|
| `ราคาที่เบิกได้` | รายการวัสดุ + วงเงินเบิกตามสิทธิ์ | Publish as CSV |
| `ราคาประมาณการ` | ราคาประมาณการ surgery (reference) | — |
| `รายการเครื่องมือวาง` | catalog LOCKING PLATE | — |
| `Sheet1` | อุปกรณ์ arthroscopy | — |
| `บันทึก` | log ผู้ป่วยทุกรายที่พิมพ์ใบยินยอม | Sheets API (write + read) |

**Column ใน `ราคาที่เบิกได้`:**
- `[0]` รหัส, `[1]` ชื่อวัสดุ, `[2]` A2/อปท, `[3]` UC, `[7]` A7, `[9]` ไร้สถานะ

---

## สิทธิ์การรักษา

| ID | ชื่อ | Column ใน Sheet |
|---|---|---|
| UC | ประกันสุขภาพถ้วนหน้า (บัตรทอง) | [3] |
| A2 | สวัสดิการข้าราชการ / อปท | [2] |
| A7 | ประกันสังคม | [7] |
| stateless | ไร้สถานะ / ต่างด้าว | [9] |

---

## Environment Variables

| Variable | ใช้ที่ไหน | ค่า |
|---|---|---|
| `SHEET_CSV_URL` | `api/items.js` | Google Sheet Publish CSV URL |

**Service Account** (hardcoded ใน `api/save.js` และ `api/history.js`):
- Email: `ortho-sheet-writer@ortho-cost-smart.iam.gserviceaccount.com`
- Project: `ortho-cost-smart`

> ⚠️ ถ้าต้องการ production ที่ปลอดภัยกว่านี้ ให้ย้าย private_key ไปไว้ใน Vercel Environment Variables

---

## Business Logic

```
ส่วนเกิน (ต่อรายการ) = max(0, unitPrice × qty − reimbursable)
reimbursable          = item[สิทธิ์ที่เลือก]  ← จาก Sheet
ยอดรวม               = ผู้ใช้แก้ไขได้ (เผื่อสำรอง)
```

---

## Known Constraints
- ใบยินยอมรองรับรายการวัสดุได้ไม่จำกัดจำนวน (แต่ถ้าเกิน 1 หน้า A4 อาจต้องปรับ print CSS)
- `api/items.js` ใช้ CSV (read-only) เพราะไม่ต้องการ Service Account สำหรับการอ่าน
- Logo โรงพยาบาลฝังเป็น base64 ใน `App.jsx` โดยตรง (ไม่ต้องพึ่ง public folder)
