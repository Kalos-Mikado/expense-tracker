import { Search, Plus, LoaderCircle, ReceiptText, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLedger } from '../LedgerContext.jsx'
import { formatMoney, formatMonth, formatDate } from '../ledger.js'
import CategoryIcon from '../components/CategoryIcon.jsx'

export default function TransactionsPage() {
  const navigate = useNavigate()
  const { month, inPeriod, visibleRecords, filter, setFilter, query, setQuery, loading, busy, setDeleting, allTotals } = useLedger()
  const startEdit = record => navigate(`/edit/${encodeURIComponent(record.id)}`)
  return <div className="transactions-page">
          <section id="transactions" className="panel scroll-mt-6" aria-labelledby="transactions-title">
            <div className="panel-heading"><div><h2 id="transactions-title">รายการรายรับรายจ่าย</h2><p className="mt-1 text-sm text-slate-500">{formatMonth(month)} · {visibleRecords.length} รายการ</p></div><span className="count-pill">{inPeriod.length}</span></div>
            <div className="transaction-tools"><div className="filter-tabs" aria-label="ประเภทของรายการ">{[['all', 'ทั้งหมด'], ['income', 'รายรับ'], ['expense', 'รายจ่าย']].map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><div className="search-box"><Search size={17} /><input aria-label="ค้นหารายการ" placeholder="ค้นหารายการ..." value={query} onChange={event => setQuery(event.target.value)} /></div></div>
            <div className="transaction-list">
              {loading ? <div className="empty-state" role="status"><LoaderCircle className="animate-spin" size={28} /><p>กำลังโหลดรายการ...</p></div> : !visibleRecords.length ? <div className="empty-state"><span className="empty-icon"><ReceiptText size={28} /></span><h3>{query || filter !== 'all' ? 'ไม่พบรายการที่ค้นหา' : 'เริ่มต้นบันทึกของคุณ'}</h3><p>{query || filter !== 'all' ? 'ลองเปลี่ยนคำค้นหาหรือประเภทของรายการ' : 'เพิ่มรายรับหรือรายจ่าย แล้วติดตามเงินของคุณได้ที่นี่'}</p>{!query && filter === 'all' && <button className="text-link" onClick={() => navigate('/add')}><Plus size={17} /> เพิ่มรายการแรก</button>}</div> : <><div className="list-columns"><span>รายการ / หมวดหมู่</span><span>จำนวนเงิน</span><span className="sr-only">จัดการ</span></div>{visibleRecords.map(record => <article className="transaction-row" key={record.id}><CategoryIcon category={record.category} income={record.type === 'income'} /><div className="record-info"><h3>{record.title}</h3><p>{record.category}<span aria-hidden="true"> · </span>{formatDate(record.date)}</p>{record.note && <p className="record-note">{record.note}</p>}</div><strong className={record.type === 'income' ? 'record-amount income-amount' : 'record-amount expense-amount'}>{record.type === 'income' ? '+' : '−'}{formatMoney(record.amount)}</strong><div className="row-actions"><button type="button" className="icon-button" aria-label={`แก้ไข ${record.title}`} title="แก้ไขรายการ" disabled={busy} onClick={() => startEdit(record)}><Pencil size={16} /></button><button type="button" className="icon-button delete-button" aria-label={`ลบ ${record.title}`} title="ลบรายการ" disabled={busy} onClick={() => setDeleting(record)}><Trash2 size={16} /></button></div></article>)}</>}
            </div>
            <div className="list-footer"><span>ยอดรวมทุกเดือน</span><strong>{formatMoney(allTotals.balance)}</strong></div>
          </section>
</div>
}
