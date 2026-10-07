import { Utensils, Car, ShoppingBag, House, HeartPulse, GraduationCap, Clapperboard, BriefcaseBusiness, Gift, CircleDollarSign, ReceiptText } from 'lucide-react'

const categoryIcons = { 'อาหารและเครื่องดื่ม': Utensils, 'เดินทาง': Car, 'ช้อปปิ้ง': ShoppingBag, 'ที่พักและบิล': House, 'สุขภาพ': HeartPulse, 'การศึกษา': GraduationCap, 'บันเทิง': Clapperboard, 'เงินเดือน': BriefcaseBusiness, 'งานเสริม': CircleDollarSign, 'ของขวัญ': Gift }
export default function CategoryIcon({ category, income, size = 18 }) {
  const Icon = categoryIcons[category] || ReceiptText
  return <span className={`category-icon ${income ? 'category-income' : ''}`}><Icon size={size} strokeWidth={1.8} /></span>
}