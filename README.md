# Ortho Cost Smart 🏥

ระบบคำนวณค่าใช้จ่ายส่วนเกิน + พิมพ์ใบยินยอม  
โรงพยาบาลหัวหิน — แผนกศัลยกรรมกระดูกและข้อ

---

## Tech Stack
- **React + Vite** — Frontend
- **Vercel Serverless Functions** — Backend API (`/api/items`)
- **Google Sheets** (Publish as CSV) — Database

---

## ขั้นตอน Setup

### 1. เตรียม Google Sheet

1. สร้าง Google Sheet ใหม่ → ชื่อ `Hospital Surgery Cost DB`
2. copy ข้อมูลจาก Excel ไปวางใน sheet ชื่อ **`ราคาที่เบิกได้`**
3. ไปที่ **File → Share → Publish to web**
4. เลือก sheet: `ราคาที่เบิกได้` → Format: **CSV** → กด Publish
5. Copy URL ที่ได้ (ประมาณ `https://docs.google.com/spreadsheets/d/.../pub?gid=...&output=csv`)

### 2. ติดตั้ง Dependencies

```bash
npm install
npm install -g vercel   # ถ้ายังไม่มี
```

### 3. ตั้งค่า Environment Variable

สร้างไฟล์ `.env.local` ในโฟลเดอร์ project:

```
SHEET_CSV_URL=วาง URL จาก Step 1 ที่นี่
```

### 4. รันในเครื่อง (Local Dev)

```bash
vercel dev
```
เปิด browser ที่ `http://localhost:3000`

> **หมายเหตุ:** ต้องใช้ `vercel dev` ไม่ใช่ `npm run dev`  
> เพราะ `vercel dev` จะรัน `/api/items` ให้ด้วย

### 5. Deploy ขึ้น Vercel

```bash
# Push ขึ้น GitHub ก่อน
git init
git add .
git commit -m "init ortho cost smart"
git remote add origin https://github.com/YOUR_USERNAME/ortho-cost-smart.git
git push -u origin main

# Deploy
vercel --prod
```

### 6. ตั้งค่า Environment Variable บน Vercel

1. ไปที่ [vercel.com](https://vercel.com) → Project → **Settings → Environment Variables**
2. เพิ่ม: `SHEET_CSV_URL` = URL จาก Step 1

---

## วิธีใช้งาน

1. **กรอกข้อมูลผู้ป่วย** — วันที่, ชื่อ, อายุ, HN, AN, สิทธิ์, วินิจฉัย
2. **ค้นหาและเลือกวัสดุ** — พิมพ์ชื่อหรือรหัสวัสดุ, คลิกเพื่อเพิ่ม
   - แก้ไข **ราคา/หน่วย** และ **จำนวน** ได้ตามต้องการ
   - ระบบคำนวณส่วนเกินอัตโนมัติตามสิทธิ์ที่เลือก
3. **ปรับยอดรวม** — แก้ไขได้เพื่อเผื่อสำรอง
4. **กดปุ่ม 🖨️ พิมพ์ใบยินยอม** — ออกใบยินยอม A4 รพ.หัวหิน

---

## โครงสร้างไฟล์

```
ortho-cost-smart/
├── api/
│   └── items.js        ← Vercel API: อ่าน Google Sheet CSV
├── src/
│   ├── main.jsx        ← React entry
│   ├── App.jsx         ← UI ทั้งหมด
│   └── App.css         ← Styles + Print styles
├── index.html
├── package.json
└── vite.config.js
```
