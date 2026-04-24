// api/items.js
// Vercel Serverless Function
// อ่าน Google Sheet ที่ Publish as CSV แล้วส่ง JSON กลับ

export default async function handler(req, res) {
  const url = process.env.SHEET_CSV_URL
  if (!url) {
    return res.status(500).json({ error: 'SHEET_CSV_URL not set in environment variables' })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`)
    const text = await response.text()
    const items = parseSheet(text)

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Parse "ราคาที่เบิกได้" sheet ──────────────────────────────────────
// Row 0 = title row, Row 1 = headers, Row 2+ = data
// Col: [0]=รหัส [1]=ชื่อ [2]=A2/อปท [3]=UC [...] [7]=A7 [8]=ต่างด้าว [9]=ไร้สถานะ
function parseSheet(csvText) {
  const rows = parseCSV(csvText)
  const items = []

  for (let i = 2; i < rows.length; i++) {
    const r = rows[i]
    const code = (r[0] || '').trim()
    const name = (r[1] || '').trim()
    if (!code || !name) continue

    items.push({
      code,
      name,
      A2:        toNum(r[2]),   // ข้าราชการ / อปท
      UC:        toNum(r[3]),   // บัตรทอง
      A7:        toNum(r[7]),   // ประกันสังคม
      stateless: toNum(r[9]),   // ไร้สถานะ
    })
  }

  return items
}

function toNum(v) {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

// Simple CSV parser — handles quoted fields with commas
function parseCSV(text) {
  return text
    .split('\n')
    .map(line => {
      const cols = []
      let cur = ''
      let inQ = false
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
        else { cur += ch }
      }
      cols.push(cur.trim())
      return cols
    })
    .filter(r => r.some(c => c !== ''))
}
