import { useState, useEffect } from 'react'

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
function fmt(n) { return Number(n || 0).toLocaleString('th-TH') }
function today() { return new Date().toISOString().split('T')[0] }
function excess(row) { return Math.max(0, (row.unitPrice * row.qty) - row.reimbursable) }

const LOGO_B64 = 'data:image/webp;base64,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'

// ── Splash Screen ──────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="splash">
      <img src={LOGO_B64} alt="logo" className="splash-logo" />
      <h1 className="splash-title">Ortho Cost Smart</h1>
      <p className="splash-sub">โรงพยาบาลหัวหิน</p>
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  const [splash,   setSplash]   = useState(true)
  const [tab,      setTab]      = useState('form')
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [apiError, setApiError] = useState(null)
  const [history,    setHistory]    = useState([])
  const [histLoad,   setHistLoad]   = useState(false)
  const [histSearch, setHistSearch] = useState('')
  const [showAll,    setShowAll]    = useState(false)  // เลื่อนดูทั้งหมด
  const [patient, setPatient] = useState({
    date: today(), name: '', age: '', hn: '', an: '', right: 'UC', diagnosis: '',
  })
  const [selected,    setSelected]    = useState([])
  const [search,      setSearch]      = useState('')
  const [editedTotal, setEditedTotal] = useState(null)

  // Splash 2 วินาที
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(e => { setApiError(e.message); setLoading(false) })
  }, [])

  function openHistory() {
    setTab('history')
    setHistLoad(true)
    fetch('/api/history')
      .then(r => r.json())
      .then(d => { setHistory(d.records || []); setHistLoad(false) })
      .catch(() => setHistLoad(false))
  }

  // รายการที่แสดงใน dropdown
  const filtered = search.length > 0
    ? items.filter(i => i.name.includes(search) || i.code.includes(search))
    : showAll ? items : []

  const autoTotal    = selected.reduce((s, r) => s + excess(r), 0)
  const displayTotal = editedTotal ?? autoTotal
  const filteredHistory = histSearch.length > 0
    ? history.filter(r => r.name.includes(histSearch) || r.hn.includes(histSearch) || r.an.includes(histSearch))
    : history

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
    setSearch(''); setShowAll(false); setEditedTotal(null)
  }
  function updateRow(idx, field, val) {
    setSelected(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
    setEditedTotal(null)
  }
  function removeRow(idx) {
    setSelected(prev => prev.filter((_, i) => i !== idx))
    setEditedTotal(null)
  }
  async function handlePrint() {
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, selected, total: displayTotal }),
      })
    } catch (e) { console.error('Save failed:', e) }
    window.print()
  }

  if (splash) return <SplashScreen />
  if (loading)  return <div className="msg">กำลังโหลดข้อมูล...</div>
  if (apiError) return <div className="msg err">เกิดข้อผิดพลาด: {apiError}</div>

  return (
    <>
      <div className="screen">
        <header>
          <h1>Ortho Cost Smart</h1>
          <p>โรงพยาบาลหัวหิน — แผนกศัลยกรรมกระดูกและข้อ</p>
          <div className="tabs">
            <button className={tab === 'form' ? 'tab active' : 'tab'} onClick={() => setTab('form')}>
              📋 บันทึกใบยินยอม
            </button>
            <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={openHistory}>
              🗂️ ประวัติ
            </button>
          </div>
        </header>

        {tab === 'form' && (
          <>
            <section className="card">
              <h2>ข้อมูลผู้ป่วย</h2>
              <div className="grid2">
                <Field label="วันที่"><input type="date" value={patient.date} onChange={e => setPat('date', e.target.value)} /></Field>
                <Field label="ชื่อ-สกุล"><input type="text" placeholder="ชื่อ นามสกุล" value={patient.name} onChange={e => setPat('name', e.target.value)} /></Field>
                <Field label="อายุ (ปี)"><input type="number" min="0" max="120" value={patient.age} onChange={e => setPat('age', e.target.value)} /></Field>
                <Field label="HN"><input type="text" value={patient.hn} onChange={e => setPat('hn', e.target.value)} /></Field>
                <Field label="AN"><input type="text" value={patient.an} onChange={e => setPat('an', e.target.value)} /></Field>
                <Field label="สิทธิ์การรักษา">
                  <select value={patient.right} onChange={e => setPat('right', e.target.value)}>
                    {RIGHTS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="การวินิจฉัยโรค">
                <input type="text" placeholder="ระบุการวินิจฉัยโรค" value={patient.diagnosis} onChange={e => setPat('diagnosis', e.target.value)} />
              </Field>
            </section>

            <section className="card">
              <h2>เลือกรายการวัสดุ / อุปกรณ์</h2>
              <div className="search-wrap">
                <input className="search" type="text"
                  placeholder="🔍 พิมพ์ค้นหา หรือกด 'ดูทั้งหมด'"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowAll(false) }}
                  onFocus={() => { if (!search) setShowAll(true) }}
                />
                {!search && (
                  <button className="browse-btn" onClick={() => setShowAll(v => !v)}>
                    {showAll ? '▲ ซ่อน' : '▼ ดูทั้งหมด'}
                  </button>
                )}
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
                          <td><input type="number" className="ni" value={row.unitPrice} onChange={e => updateRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></td>
                          <td><input type="number" className="ni sm" min="1" value={row.qty} onChange={e => updateRow(idx, 'qty', parseInt(e.target.value) || 1)} /></td>
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

            {selected.length > 0 && (
              <section className="card total-card">
                <div className="total-row">
                  <span>รวมส่วนเกินทั้งสิ้น</span>
                  <div className="total-input-wrap">
                    <input type="number" className="total-in" value={displayTotal}
                      onChange={e => setEditedTotal(parseFloat(e.target.value) || 0)} />
                    <span>บาท</span>
                  </div>
                </div>
                <p className="hint">* แก้ไขยอดรวมได้ก่อนพิมพ์ (เผื่อสำรองค่าใช้จ่าย)</p>
                <button className="print-btn" onClick={handlePrint}>🖨️ พิมพ์ใบยินยอม A4</button>
              </section>
            )}
          </>
        )}

        {tab === 'history' && (
          <section className="card">
            <h2>ประวัติการบันทึก</h2>
            <input className="search" type="text"
              placeholder="🔍 ค้นหาด้วย ชื่อ / HN / AN..."
              value={histSearch} onChange={e => setHistSearch(e.target.value)}
              style={{ marginBottom: '16px' }} />
            {histLoad && <div className="msg">กำลังโหลดประวัติ...</div>}
            {!histLoad && filteredHistory.length === 0 && <div className="msg">ไม่พบข้อมูล</div>}
            {!histLoad && filteredHistory.length > 0 && (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>วันที่/เวลา</th><th>ชื่อ</th><th>HN</th><th>AN</th>
                      <th>สิทธิ์</th><th>วินิจฉัย</th><th>รายการวัสดุ</th><th>ส่วนเกิน (บ.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ whiteSpace:'nowrap', fontSize:'11px' }}>{r.datetime}</td>
                        <td>{r.name}</td><td>{r.hn}</td><td>{r.an}</td>
                        <td style={{ whiteSpace:'nowrap' }}>{r.right}</td>
                        <td>{r.diagnosis}</td>
                        <td style={{ fontSize:'11px' }}>{r.items}</td>
                        <td className="red bold">{Number(r.total||0).toLocaleString('th-TH')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="print-only">
        <PrintForm patient={patient} selected={selected} total={displayTotal} />
      </div>
    </>
  )
}

function Field({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>
}

function PrintForm({ patient, selected, total }) {
  return (
    <div className="pf">
      <div className="pf-head">
        <img src={LOGO_B64} alt="logo" className="pf-logo" />
        <div className="pf-head-text">
          <div className="pf-badge">เอกสารสำคัญ</div>
          <div className="pf-hosp">โรงพยาบาลหัวหิน</div>
          <div className="pf-title">หนังสือแสดงความยินยอมชำระค่ารักษาพยาบาล</div>
          <div className="pf-sub">
            กรณีส่งตรวจพิเศษเพื่อวินิจฉัยโรค, เวชภัณฑ์, ยานอกบัญชียาหลักแห่งชาติ<br />
            อวัยวะเทียมและอุปกรณ์การแพทย์ที่ผู้ป่วย/ญาติประสงค์ใช้และยินยอมชำระเงิน
          </div>
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
      <div className="pf-row" style={{ marginTop:'10pt' }}>
        มีความจำเป็นต้อง ☑ อวัยวะเทียมและอุปกรณ์การแพทย์ ที่ผู้ป่วย/ญาติประสงค์ใช้และยินยอมชำระเงิน ดังนี้
      </div>
      <table className="pf-tbl">
        <thead>
          <tr>
            <th style={{ width:'5%' }}>ลำดับ</th>
            <th style={{ width:'48%' }}>รายการ</th>
            <th style={{ width:'17%' }}>ราคา/หน่วย (บาท)</th>
            <th style={{ width:'10%' }}>จำนวน</th>
            <th style={{ width:'20%' }}>ราคาร่วมจ่าย (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((row, idx) => (
            <tr key={idx}>
              <td className="c">{idx+1}.</td>
              <td>{row.item.name}</td>
              <td className="r">{fmt(row.unitPrice)}</td>
              <td className="c">{row.qty}</td>
              <td className="r">{fmt(excess(row))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pf-total">รวมจ่ายเป็นเงินทั้งสิ้น&emsp;<u>&nbsp;&nbsp;&nbsp;{fmt(total)}&nbsp;&nbsp;&nbsp;</u>&emsp;บาท</div>
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
          ['ผู้ป่วย/ญาติ',        'ผู้ให้ความยินยอม'],
          ['แพทย์ผู้ให้การรักษา','เลข ว.............................'],
          ['พยาน',               'พยานฝ่ายผู้ให้ความยินยอม'],
          ['พยาน',               'พยานฝ่ายแพทย์ผู้ให้การรักษา'],
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
