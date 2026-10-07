import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Plus, Pencil, LoaderCircle, Database, ReceiptText } from 'lucide-react'
import { useLedger } from '../LedgerContext.jsx'
import { CATEGORIES, today, createId, parseAmount, isDate } from '../ledger.js'

const newForm = () => ({ type: 'expense', title: '', amount: '', category: CATEGORIES.expense[0], date: today(), note: '' })

export default function EntryPage() {
  const { id: editing } = useParams()
  const navigate = useNavigate()
  const { records, loading, saving, busy, dbError, saveRecord } = useLedger()
  const [form, setForm] = useState(newForm)
  const [formError, setFormError] = useState('')
  const initialized = useRef(false)
  const record = editing ? records.find(item => item.id === editing) : null

  useEffect(() => {
    if (record && !initialized.current) {
      setForm({ ...record, amount: (record.amount / 100).toFixed(2) })
      initialized.current = true
    }
  }, [record])

  function changeField(event) {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
    setFormError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const amount = parseAmount(form.amount)
    if (!form.title.trim() || !amount || !isDate(form.date)) {
      setFormError('กรอกชื่อรายการ วันที่ และจำนวนเงินมากกว่า 0 (ทศนิยมไม่เกิน 2 ตำแหน่ง)')
      return
    }
    try {
      await saveRecord({ id: editing || createId(), type: form.type, title: form.title.trim(), amount, category: form.category, date: form.date, note: form.note.trim() }, Boolean(editing))
      navigate('/transactions')
    } catch {
      setFormError('บันทึกไม่สำเร็จ กรุณาตรวจสอบพื้นที่เก็บข้อมูล แล้วลองอีกครั้ง หากรายการถูกลบจากแท็บอื่น ให้กลับหน้ารายการก่อน')
    }
  }

  if (loading) return <div className="panel empty-state" role="status"><LoaderCircle className="animate-spin" size={28} /><p>กำลังโหลดรายการ...</p></div>
  if (editing && !record && !dbError) return <div className="panel empty-state"><ReceiptText size={28} /><h2>ไม่พบรายการนี้</h2><p>รายการอาจถูกลบไปแล้ว</p><Link className="text-link" to="/transactions">กลับหน้ารายการ</Link></div>
  return <div className="entry-page">
          <section id="entry-form" className="panel entry-panel scroll-mt-6" aria-labelledby="entry-title"><div className="panel-heading"><h2 id="entry-title">{editing ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2><span className="form-plus">{editing ? <Pencil size={19} /> : <Plus size={21} />}</span></div>
            <form onSubmit={submit} className="entry-fields">
              <fieldset disabled={busy} className="entry-form-grid"><legend className="sr-only">ข้อมูลรายการ</legend>
                <div className="type-picker"><label className={form.type === 'expense' ? 'type-expense chosen' : ''}><input type="radio" name="type" value="expense" checked={form.type === 'expense'} onChange={() => { setForm(previous => ({ ...previous, type: 'expense', category: CATEGORIES.expense[0] })); setFormError('') }} /><ArrowUpRight size={17} /> รายจ่าย</label><label className={form.type === 'income' ? 'type-income chosen' : ''}><input type="radio" name="type" value="income" checked={form.type === 'income'} onChange={() => { setForm(previous => ({ ...previous, type: 'income', category: CATEGORIES.income[0] })); setFormError('') }} /><ArrowDownLeft size={17} /> รายรับ</label></div>
                <div><label htmlFor="title" className="field-label">ชื่อรายการ <span className="text-rose-500">*</span></label><input id="title" name="title" className="field" placeholder="เช่น อาหารกลางวัน" maxLength={100} required value={form.title} onChange={changeField} /></div>
                <div><label htmlFor="amount" className="field-label">จำนวนเงิน <span className="text-rose-500">*</span></label><div className="amount-input"><span>฿</span><input id="amount" name="amount" type="number" inputMode="decimal" min="0.01" max="999999999.99" step="0.01" placeholder="0.00" required value={form.amount} onChange={changeField} /><span className="text-sm text-slate-400">บาท</span></div></div>
                <div><label htmlFor="category" className="field-label">หมวดหมู่</label><select id="category" name="category" className="field" value={form.category} onChange={changeField}>{CATEGORIES[form.type].map(category => <option key={category}>{category}</option>)}</select></div>
                <div><label htmlFor="date" className="field-label">วันที่ <span className="text-rose-500">*</span></label><input id="date" name="date" type="date" className="field" required min="1900-01-01" max="9999-12-31" value={form.date} onChange={changeField} /></div>
                <div><label htmlFor="note" className="field-label">โน้ต <span className="text-xs font-normal text-slate-400">(ไม่จำเป็น)</span></label><textarea id="note" name="note" className="field resize-y" rows={2} maxLength={300} placeholder="รายละเอียดเพิ่มเติม..." value={form.note} onChange={changeField} /></div>
              </fieldset>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="primary-button w-full" type="submit" disabled={busy}>{saving ? <LoaderCircle size={18} className="animate-spin" /> : <Plus size={18} />}{saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</button>
              {editing && <button type="button" className="cancel-edit" onClick={() => navigate('/transactions')} disabled={saving}>ยกเลิกการแก้ไข</button>}
            </form>
            <div className="save-note"><Database size={15} /><span>{loading ? 'กำลังเปิดข้อมูล...' : dbError ? 'ยังไม่พร้อมบันทึก' : 'บันทึกอัตโนมัติในเบราว์เซอร์นี้'}</span></div>
          </section>
</div>
}
