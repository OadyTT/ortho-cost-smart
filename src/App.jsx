import { useState, useEffect } from 'react'

// ── Constants ──────────────────────────────────────────────────────────
const RIGHTS = [
  { id: 'UC',        label: 'ประกันสุขภาพถ้วนหน้า (บัตรทอง)' },
  { id: 'A2',        label: 'สวัสดิการข้าราชการ / อปท' },
  { id: 'A7',        label: 'ประกันสังคม' },
  { id: 'stateless', label: 'ไร้สถานะ / ต่างด้าว' },
]

const RIGHT_LABEL = {
  UC: 'ประกันสุขภาพถ้วนหน้า', A2: 'สวัสดิการข้าราชการ',
  A7: 'ประกันสังคม',           stateless: 'ไร้สถานะ / ต่างด้าว',
}

// ── Helpers ────────────────────────────────────────────────────────────
function fmt(n) { return Number(n || 0).toLocaleString('th-TH') }
function today() { return new Date().toISOString().split('T')[0] }
function excess(row) {
  return Math.max(0, (row.unitPrice * row.qty) - row.reimbursable)
}

// ── App ────────────────────────────────────────────────────────────────
export default function App() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)

  const [patient, setPatient] = useState({
    date: today(), name: '', age: '', hn: '', an: '',
    right: 'UC', diagnosis: '',
  })
  const [selected,    setSelected]    = useState([])  // [{item, qty, unitPrice, reimbursable}]
  const [search,      setSearch]      = useState('')
  const [editedTotal, setEditedTotal] = useState(null) // null = use auto-calc

  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(e => { setApiError(e.message); setLoading(false) })
  }, [])

  // ── Derived ──────────────────────────────────────────────────────────
  const filtered = search.length > 1
    ? items.filter(i => i.name.includes(search) || i.code.includes(search)).slice(0, 12)
    : []

  const autoTotal    = selected.reduce((s, r) => s + excess(r), 0)
  const displayTotal = editedTotal ?? autoTotal

  // ── Handlers ─────────────────────────────────────────────────────────
  function setPat(field, val) {
    setPatient(p => ({ ...p, [field]: val }))
    if (field === 'right') {
      setSelected(prev => prev.map(r => ({ ...r, reimbursable: r.item[val] || 0 })))
      setEditedTotal(null)
    }
  }

  function addItem(item) {
    const reimbursable = item[patient.right] || 0
    setSelected(prev => [...prev, { item, qty: 1, unitPrice: reimbursable, reimbursable }])
    setSearch('')
    setEditedTotal(null)
  }

  function updateRow(idx, field, val) {
    setSelected(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
    setEditedTotal(null)
  }

  function removeRow(idx) {
    setSelected(prev => prev.filter((_, i) => i !== idx))
    setEditedTotal(null)
  }

  // ── Render ────────────────────────────────────────────────────────────
  if (loading)  return <div className="msg">กำลังโหลดข้อมูล...</div>
  if (apiError) return <div className="msg err">เกิดข้อผิดพลาด: {apiError}</div>

  return (
    <>
      {/* ─── SCREEN ─── */}
      <div className="screen">
        <header>
          <h1>Ortho Cost Smart</h1>
          <p>โรงพยาบาลหัวหิน — แผนกศัลยกรรมกระดูกและข้อ</p>
        </header>

        {/* Patient Info */}
        <section className="card">
          <h2>ข้อมูลผู้ป่วย</h2>
          <div className="grid2">
            <Field label="วันที่">
              <input type="date" value={patient.date} onChange={e => setPat('date', e.target.value)} />
            </Field>
            <Field label="ชื่อ-สกุล">
              <input type="text" placeholder="ชื่อ นามสกุล" value={patient.name} onChange={e => setPat('name', e.target.value)} />
            </Field>
            <Field label="อายุ (ปี)">
              <input type="number" min="0" max="120" value={patient.age} onChange={e => setPat('age', e.target.value)} />
            </Field>
            <Field label="HN">
              <input type="text" value={patient.hn} onChange={e => setPat('hn', e.target.value)} />
            </Field>
            <Field label="AN">
              <input type="text" value={patient.an} onChange={e => setPat('an', e.target.value)} />
            </Field>
            <Field label="สิทธิ์การรักษา">
              <select value={patient.right} onChange={e => setPat('right', e.target.value)}>
                {RIGHTS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="การวินิจฉัยโรค">
            <input type="text" placeholder="ระบุการวินิจฉัยโรค" value={patient.diagnosis}
              onChange={e => setPat('diagnosis', e.target.value)} />
          </Field>
        </section>

        {/* Item Selector */}
        <section className="card">
          <h2>เลือกรายการวัสดุ / อุปกรณ์</h2>
          <div className="search-wrap">
            <input
              className="search"
              type="text"
              placeholder="🔍 พิมพ์ค้นหาชื่อหรือรหัสวัสดุ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {filtered.length > 0 && (
              <ul className="dropdown">
                {filtered.map(item => (
                  <li key={item.code} onClick={() => addItem(item)}>
                    <span className="code">{item.code}</span>
                    <span className="iname">{item.name}</span>
                    <span className="reimb-tag">เบิกได้ {fmt(item[patient.right])} บ.</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected.length > 0 && (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="left">รายการ</th>
                    <th>ราคา/หน่วย (บ.)</th>
                    <th>จำนวน</th>
                    <th>เบิกได้ (บ.)</th>
                    <th>ส่วนเกิน (บ.)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selected.map((row, idx) => (
                    <tr key={idx}>
                      <td className="left small">{row.item.name}</td>
                      <td>
                        <input type="number" className="ni" value={row.unitPrice}
                          onChange={e => updateRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                      </td>
                      <td>
                        <input type="number" className="ni sm" min="1" value={row.qty}
                          onChange={e => updateRow(idx, 'qty', parseInt(e.target.value) || 1)} />
                      </td>
                      <td className="green">{fmt(row.reimbursable)}</td>
                      <td className="red bold">{fmt(excess(row))}</td>
                      <td><button className="del" onClick={() => removeRow(idx)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Total + Print */}
        {selected.length > 0 && (
          <section className="card total-card">
            <div className="total-row">
              <span>รวมส่วนเกินทั้งสิ้น</span>
              <div className="total-input-wrap">
                <input
                  type="number"
                  className="total-in"
                  value={displayTotal}
                  onChange={e => setEditedTotal(parseFloat(e.target.value) || 0)}
                />
                <span>บาท</span>
              </div>
            </div>
            <p className="hint">* แก้ไขยอดรวมได้ก่อนพิมพ์ (เผื่อสำรองค่าใช้จ่าย)</p>
            <button className="print-btn" onClick={() => window.print()}>
              🖨️ พิมพ์ใบยินยอม A4
            </button>
          </section>
        )}
      </div>

      {/* ─── PRINT ONLY ─── */}
      <div className="print-only">
        <PrintForm patient={patient} selected={selected} total={displayTotal} />
      </div>
    </>
  )
}

// ── Reusable Field wrapper ─────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

// ── Print consent form — matches โรงพยาบาลหัวหิน PDF ─────────────────
function PrintForm({ patient, selected, total }) {
  return (
    <div className="pf">
      <div className="pf-head">
        <div className="pf-badge">เอกสารสำคัญ</div>
        <div className="pf-hosp">โรงพยาบาลหัวหิน</div>
        <div className="pf-title">หนังสือแสดงความยินยอมชำระค่ารักษาพยาบาล</div>
        <div className="pf-sub">
          กรณีส่งตรวจพิเศษเพื่อวินิจฉัยโรค, เวชภัณฑ์, ยานอกบัญชียาหลักแห่งชาติ<br />
          อวัยวะเทียมและอุปกรณ์การแพทย์ที่ผู้ป่วย/ญาติประสงค์ใช้และยินยอมชำระเงิน
        </div>
      </div>

      <div className="pf-date-row">วันที่ {patient.date}</div>

      <div className="pf-row">
        ผู้ป่วยชื่อ <u>{patient.name}</u>&emsp;อายุ <u>{patient.age}</u> ปี&emsp;
        HN <u>{patient.hn}</u>&emsp;AN <u>{patient.an}</u>
      </div>
      <div className="pf-row">
        สิทธิการรักษา&emsp;
        {['UC','A2','A7','stateless'].map(id => (
          <span key={id} className="pf-check">
            <span className="box">{patient.right === id ? '☑' : '☐'}</span> {RIGHT_LABEL[id]}&emsp;
          </span>
        ))}
      </div>
      <div className="pf-row">การวินิจฉัยโรค (ระบุ) <u>{patient.diagnosis}</u></div>

      <div className="pf-row" style={{ marginTop: '10pt' }}>
        มีความจำเป็นต้อง ☑ อวัยวะเทียมและอุปกรณ์การแพทย์ ที่ผู้ป่วย/ญาติประสงค์ใช้และยินยอมชำระเงิน ดังนี้
      </div>

      <table className="pf-tbl">
        <thead>
          <tr>
            <th style={{ width: '5%' }}>ลำดับ</th>
            <th style={{ width: '48%' }}>รายการ</th>
            <th style={{ width: '17%' }}>ราคา/หน่วย (บาท)</th>
            <th style={{ width: '10%' }}>จำนวน</th>
            <th style={{ width: '20%' }}>ราคาร่วมจ่าย (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((row, idx) => (
            <tr key={idx}>
              <td className="c">{idx + 1}.</td>
              <td>{row.item.name}</td>
              <td className="r">{fmt(row.unitPrice)}</td>
              <td className="c">{row.qty}</td>
              <td className="r">{fmt(excess(row))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pf-total">
        รวมจ่ายเป็นเงินทั้งสิ้น&emsp;<u>&nbsp;&nbsp;&nbsp;{fmt(total)}&nbsp;&nbsp;&nbsp;</u>&emsp;บาท
      </div>

      <div className="pf-legal">
        ผู้ป่วยรับทราบและขอสละสิทธิ์ในการดำเนินการร้องเรียนหรือเรียกร้องผลประโยชน์อื่นใดอันพึงมีตามกฎหมาย
        ต่อไปและเข้าใจข้อความในหนังสือนี้โดยละเอียดตลอดแล้ว รวมถึงผู้ป่วยได้อ่านข้อความเหล่านี้หรือผู้อื่นได้อ่านให้ฟัง
        เรียบร้อยแล้ว ขอรับรองว่าความประสงค์ที่เกิดขึ้นนี้เป็นไปด้วยความสมัครใจ จึงลงชื่อไว้เป็นหลักฐาน
      </div>

      <div className="pf-consent">***ได้อ่านข้อความแล้ว รับทราบ/ยินยอมชำระ</div>
      <div className="pf-write">(กรุณาเขียนตามข้อความข้างต้น)</div>
      <div className="pf-line" />

      <div className="pf-sigs">
        {[
          ['ผู้ป่วย/ญาติ', 'ผู้ให้ความยินยอม'],
          ['แพทย์ผู้ให้การรักษา', 'เลข ว.............................'],
          ['พยาน', 'พยานฝ่ายผู้ให้ความยินยอม'],
          ['พยาน', 'พยานฝ่ายแพทย์ผู้ให้การรักษา'],
        ].map(([role, sub], i) => (
          <div key={i} className="pf-sig">
            <div>ลงชื่อ..................................{role}</div>
            <div>(..........................................)</div>
            <div className="sub">{sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
