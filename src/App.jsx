import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Wallet, LayoutDashboard, List, Plus, Check, X, CalendarDays, AlertCircle, Trash2 } from 'lucide-react'
import { CATEGORIES, MONTH_KEY, today, formatMonth, summarize, isDate } from './ledger.js'
import { listRecords, addRecord, updateRecord, removeRecord } from './database.js'
import { LedgerContext } from './LedgerContext.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import EntryPage from './pages/EntryPage.jsx'

function initialMonth() {
  try {
    const saved = localStorage.getItem(MONTH_KEY)
    return saved === '' || (saved && isDate(`${saved}-01`)) ? saved : today().slice(0, 7)
  } catch { return today().slice(0, 7) }
}

export default function App() {
  const location = useLocation()
  const [records, setRecords] = useState([])
  const [month, setMonth] = useState(initialMonth)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dbError, setDbError] = useState('')
  const [toast, setToast] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [preferenceWarning, setPreferenceWarning] = useState(false)
  const deleteDialog = useRef(null)
  const headingRef = useRef(null)
  const mainRef = useRef(null)
  const busy = loading || saving || Boolean(dbError)
  const overview = location.pathname === '/overview'
  const transactions = location.pathname === '/transactions'
  const entry = location.pathname === '/add' || location.pathname.startsWith('/edit/')
  const title = overview ? 'ภาพรวมการเงิน' : transactions ? 'รายการรายรับรายจ่าย' : location.pathname === '/add' ? 'เพิ่มรายการ' : entry ? 'แก้ไขรายการ' : 'ไม่พบหน้านี้'

  useEffect(() => {
    let active = true
    async function refresh() {
      try {
        const data = await listRecords()
        if (active) { setRecords(data); setDbError('') }
      } catch {
        if (active) setDbError('เปิดข้อมูลไม่สำเร็จ กรุณาอนุญาตให้เบราว์เซอร์เก็บข้อมูล แล้วรีเฟรชหน้าอีกครั้ง')
      } finally { if (active) setLoading(false) }
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('focus', refresh) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(MONTH_KEY, month); setPreferenceWarning(false) }
    catch { setPreferenceWarning(true) }
  }, [month])

  useEffect(() => {
    document.title = `${title} — Expense Tracker`
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    headingRef.current?.focus({ preventScroll: true })
  }, [location.pathname, title])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    setDeleteError('')
    if (deleting) deleteDialog.current?.showModal()
    else deleteDialog.current?.close()
  }, [deleting])

  const inPeriod = useMemo(() => records.filter(record => !month || record.date.startsWith(month)), [records, month])
  const totals = useMemo(() => summarize(inPeriod), [inPeriod])
  const allTotals = useMemo(() => summarize(records), [records])
  const visibleRecords = useMemo(() => inPeriod.filter(record =>
    (filter === 'all' || record.type === filter) &&
    `${record.title} ${record.category} ${record.note}`.toLocaleLowerCase('th').includes(query.trim().toLocaleLowerCase('th')),
  ).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [inPeriod, filter, query])
  const breakdown = useMemo(() => CATEGORIES.expense.map(category => ({ category, amount: inPeriod.filter(record => record.type === 'expense' && record.category === category).reduce((sum, record) => sum + record.amount, 0) })).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount), [inPeriod])
  const savingRate = totals.income > 0 ? Math.round(totals.balance / totals.income * 100) : null

  async function saveRecord(record, editing) {
    setSaving(true)
    try {
      if (editing) await updateRecord(record)
      else await addRecord(record)
      setRecords(await listRecords())
      if (month && !record.date.startsWith(month)) setMonth(record.date.slice(0, 7))
      setFilter('all'); setQuery('')
      setToast(editing ? 'แก้ไขรายการเรียบร้อย' : 'บันทึกรายการเรียบร้อย')
    } finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (busy || !deleting) return
    setSaving(true)
    try {
      await removeRecord(deleting.id)
      setRecords(await listRecords())
      setDeleting(null)
      setToast('ลบรายการเรียบร้อย')
    } catch { setDeleteError('ลบไม่สำเร็จ กรุณาลองอีกครั้ง') }
    finally { setSaving(false) }
  }

  const context = { records, month, setMonth, inPeriod, totals, allTotals, breakdown, savingRate, visibleRecords, filter, setFilter, query, setQuery, loading, saving, dbError, busy, setDeleting, saveRecord }
  const navClass = ({ isActive }) => `nav-item${isActive ? ' nav-active' : ''}`

  return <LedgerContext.Provider value={context}><div className="min-h-screen bg-[#f4f6fa] text-[#202d45]">
    <button className="skip-link" type="button" onClick={() => mainRef.current?.focus()}>ข้ามไปเนื้อหาหลัก</button>
    <aside className="sidebar">
      <Link className="brand" to="/overview"><span className="brand-mark"><Wallet size={23} /></span><span>Expense<span className="brand-sub">TRACKER</span></span></Link>
      <span className="nav-label">พื้นที่ของคุณ</span>
      <nav aria-label="เมนูหลัก" className="route-nav">
        <NavLink className={navClass} to="/overview" aria-label="ภาพรวม"><LayoutDashboard size={19} /><span className="nav-text">ภาพรวม</span></NavLink>
        <NavLink className={navClass} to="/transactions" aria-label="รายการทั้งหมด"><List size={20} /><span className="nav-text">รายการทั้งหมด</span></NavLink>
        <NavLink className={({ isActive }) => `nav-item${isActive || entry ? ' nav-active' : ''}`} to="/add" aria-label="เพิ่มรายการ"><Plus size={20} /><span className="nav-text">เพิ่มรายการ</span></NavLink>
      </nav>
      <div className="sidebar-bottom"><span className="rounded-full bg-[#edf1fc] p-2"><Wallet size={19} /></span><div className="text-sm font-semibold">บัญชีส่วนตัว<p className="mt-0.5 text-xs font-normal text-slate-500">สกุลเงิน · บาทไทย</p></div></div>
    </aside>
    <main id="main" ref={mainRef} tabIndex={-1} className="main-content">
      <header className="page-header">
        <div><div className="eyebrow">MY MONEY, MY PLAN</div><h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight">{title}</h1>{overview && <p className="mt-2 text-sm text-slate-500">เห็นทุกยอด วางแผนทุกวัน</p>}</div>
        <div className="header-actions">
          {(overview || transactions) && <><div className="period-picker"><CalendarDays size={18} className="text-slate-500" /><label className="sr-only" htmlFor="month">เดือนที่ต้องการดู</label><input id="month" aria-label="เดือนที่ต้องการดู" type="month" min="1900-01" max="9999-12" value={month} onChange={event => setMonth(event.target.value)} /><button type="button" onClick={() => setMonth('')} className={!month ? 'period-all selected' : 'period-all'}>ทุกเดือน</button></div><Link className="primary-button header-add" to="/add"><Plus size={18} />เพิ่มรายการ</Link></>}
          {entry && <Link className="secondary-button" to="/transactions">กลับหน้ารายการ</Link>}
        </div>
      </header>
      {dbError && <div className="error-banner" role="alert"><AlertCircle size={20} /><span>{dbError}</span></div>}
      {preferenceWarning && <p className="mb-4 text-sm text-amber-800" role="status">จำเดือนที่เลือกไม่ได้ แต่ยังบันทึกรายการได้ตามปกติ</p>}
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/add" element={<EntryPage key="add" />} />
        <Route path="/edit/:id" element={<EntryPage key={location.pathname} />} />
        <Route path="*" element={<div className="panel empty-state"><h2 className="text-xl font-semibold">ไม่พบหน้านี้</h2><p>ตรวจสอบลิงก์หรือกลับไปหน้าภาพรวม</p><Link className="text-link" to="/overview">กลับหน้าภาพรวม</Link></div>} />
      </Routes>
      <footer className="page-footer"><span>Expense Tracker</span><span>ข้อมูลอยู่ในเบราว์เซอร์และอุปกรณ์นี้</span></footer>
    </main>
    {toast && <div className="toast" role="status"><Check size={18} /><span>{toast}</span><button aria-label="ปิดข้อความ" onClick={() => setToast('')}><X size={16} /></button></div>}
    <dialog ref={deleteDialog} className="delete-dialog" onCancel={event => { if (saving) event.preventDefault(); else setDeleting(null) }} onClose={() => { if (!saving) setDeleting(null) }} aria-labelledby="delete-title"><div className="dialog-icon"><Trash2 size={24} /></div><h2 id="delete-title">ลบรายการนี้?</h2><p className="mt-2 break-words text-sm leading-6 text-slate-500">{deleting?.title}<br />เมื่อลบแล้วจะกู้คืนรายการนี้ไม่ได้</p>{deleteError && <p className="form-error" role="alert">{deleteError}</p>}<div className="mt-6 flex gap-3"><button className="secondary-button flex-1" type="button" disabled={saving} onClick={() => setDeleting(null)}>ยกเลิก</button><button className="danger-button flex-1" type="button" disabled={saving} onClick={confirmDelete}>{saving ? 'กำลังลบ...' : 'ยืนยันการลบ'}</button></div></dialog>
  </div></LedgerContext.Provider>
}
