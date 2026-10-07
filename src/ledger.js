export const MONTH_KEY = 'expense-tracker:selected-month'

export const CATEGORIES = {
  income: ['เงินเดือน', 'งานเสริม', 'ของขวัญ', 'รายรับอื่น ๆ'],
  expense: ['อาหารและเครื่องดื่ม', 'เดินทาง', 'ช้อปปิ้ง', 'ที่พักและบิล', 'สุขภาพ', 'การศึกษา', 'บันเทิง', 'รายจ่ายอื่น ๆ'],
}

// Store integer satang, so 0.10 + 0.20 is exactly 0.30 baht.
export function parseAmount(value) {
  const text = String(value).trim()
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(text)) return null
  const [baht, satang = ''] = text.split('.')
  const amount = Number(baht) * 100 + Number(satang.padEnd(2, '0'))
  return amount > 0 ? amount : null
}

export function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= '1900-01-01' && value <= '9999-12-31'
}

export function validateRecord(record) {
  return record && typeof record.id === 'string' && record.id.length > 0 &&
    ['income', 'expense'].includes(record.type) &&
    typeof record.title === 'string' && record.title.trim().length > 0 && record.title.length <= 100 &&
    Number.isSafeInteger(record.amount) && record.amount > 0 && record.amount <= 99999999999 &&
    isDate(record.date) && CATEGORIES[record.type].includes(record.category) &&
    typeof record.note === 'string' && record.note.length <= 300
}

export function summarize(records) {
  const totals = records.reduce((sum, record) => {
    sum[record.type] += record.amount
    return sum
  }, { income: 0, expense: 0 })
  return { ...totals, balance: totals.income - totals.expense }
}

export function today() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function createId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  // getRandomValues also works on HTTP development previews.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function formatMoney(satang) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(satang / 100)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(`${date}T12:00:00`))
}

export function formatMonth(month) {
  return month ? new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`)) : 'ทุกเดือน'
}
