# Expense Tracker — เว็บบันทึกรายรับรายจ่าย

เว็บภาษาไทยสำหรับบันทึกการเงินส่วนตัว ใช้ React, Tailwind CSS และ Vite ใช้ React Router แยกหน้า พร้อม GitHub Actions สำหรับ deploy บน GitHub Pages

## สิ่งที่ทำได้

- เพิ่ม แก้ไข และลบรายการรายรับหรือรายจ่าย โดยยืนยันก่อนลบ
- ระบุชื่อรายการ จำนวนเงิน หมวดหมู่ วันที่ และโน้ต
- ดูยอดรายรับ รายจ่าย และยอดคงเหลือในเดือนที่เลือก หรือทุกเดือน
- ค้นหาจากชื่อ หมวดหมู่ และโน้ต พร้อมกรองประเภทรายการ
- ดูกราฟสัดส่วนรายจ่ายตามหมวดหมู่และเปอร์เซ็นต์เงินเหลือเก็บ
- รองรับหน้าจอมือถือและคอมพิวเตอร์
- เก็บจำนวนเงินเป็นจำนวนเต็มหน่วยสตางค์ เพื่อเลี่ยงความคลาดเคลื่อนของทศนิยม

## หน้าต่าง ๆ และ Router

ใช้ `HashRouter` ของ React Router โดยเปลี่ยนหน้าเมื่อกดเมนู ไม่ใช่การเลื่อนไปยังส่วนอื่นในหน้าเดิม

| หน้า | Route |
| --- | --- |
| ภาพรวม: ยอดสรุปและกราฟหมวดหมู่ | `/#/overview` |
| รายการทั้งหมด: ค้นหา กรอง แก้ไข และลบ | `/#/transactions` |
| เพิ่มรายรับหรือรายจ่าย | `/#/add` |
| แก้ไขเฉพาะรายการ | `/#/edit/:id` |

บันทึกสำเร็จแล้วกลับไปหน้ารายการ ข้อมูลทุกหน้าใช้ IndexedDB ชุดเดียวกัน กด Back/Forward และรีเฟรชหน้าแก้ไขได้ เมนูบนมือถืออยู่ด้านบน

HashRouter เก็บ route หลังเครื่องหมาย `#` จึงไม่ต้องเพิ่ม server rewrite เพื่อเปิดหน้าด้านในบน GitHub Pages ตั้งค่า `base: './'` และ workflow เดิมได้เลย

## ข้อมูลเก็บที่ไหน

**IndexedDB** เก็บรายการทั้งหมดใน database `expense-tracker-db`, object store `transactions` ใช้ `id` เป็น primary key และมี index ของ `date` กับ `type`

**Local Storage** เก็บเดือนที่ผู้ใช้เลือกดู โดยใช้ key `expense-tracker:selected-month` จึงยังมีการใช้งาน Local Storage ตามโจทย์เดิม แต่รายการหลักใช้ IndexedDB ตามข้อกำหนดใหม่

ข้อมูลอยู่ในเบราว์เซอร์และอุปกรณ์ที่ใช้ ไม่มีบัญชีผู้ใช้หรือ server เก็บข้อมูล รีเฟรชหรือเปิดเว็บเดิมใหม่ในเบราว์เซอร์เดิมแล้วข้อมูลยังอยู่ การล้างข้อมูลเว็บไซต์หรือใช้โหมดส่วนตัวอาจทำให้ข้อมูลหาย และข้อมูลจาก localhost จะไม่ย้ายไปยัง GitHub Pages อัตโนมัติ

ถ้าอาจารย์กำหนดให้ **รายการทั้งหมด** ต้องเก็บใน Local Storage ควรตรวจสอบก่อนว่าอนุญาตให้ใช้ IndexedDB เป็นที่เก็บหลักหรือไม่

## เริ่มต้นบนเครื่อง (Windows / macOS / Linux)

1. ติดตั้ง Node.js รุ่น 22 LTS หรือใหม่กว่าที่รองรับ Vite
2. แตกไฟล์ `expense-tracker.zip`
3. เปิดโฟลเดอร์ `expense-tracker` ด้วย VS Code
4. เลือกเมนู Terminal → New Terminal ให้ terminal อยู่ในโฟลเดอร์ที่มี `package.json`
5. ติดตั้ง dependencies:

```bash
npm install
```

6. เปิดเว็บไซต์สำหรับพัฒนา:

```bash
npm run dev
```

7. เปิด URL ที่ terminal แสดง เช่น `http://localhost:5173`
8. หยุด server ด้วย Ctrl+C

## ทดสอบและ build

```bash
npm test
npm run build
npm run preview
```

`npm test` ตรวจสอบการคำนวณเงิน วันที่ และการเพิ่ม/แก้ไข/ลบใน IndexedDB จำลอง ส่วน `npm run build` สร้างเว็บพร้อม deploy ในโฟลเดอร์ `dist`

## Deploy บน GitHub Pages ผ่าน GitHub Actions

โปรเจกต์ตั้ง `base: './'` ไว้แล้ว จึงโหลด assets ได้เมื่อเว็บอยู่ใต้ path ของ repository โดยไม่ต้องแก้เป็นชื่อ repository

1. สร้าง repository บน GitHub เช่น `expense-tracker` เลือก Public สำหรับวิธีใช้งาน GitHub Pages ฟรีทั่วไป
2. เปิด terminal ในโฟลเดอร์โปรเจกต์ แล้วรันคำสั่งทีละบรรทัด (ต้องติดตั้ง Git ก่อน):

```bash
git init
git add .
git commit -m "Create expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

เปลี่ยน `YOUR_USERNAME` เป็นชื่อบัญชี และเปลี่ยน `expense-tracker` ถ้าใช้ชื่อ repository อื่น ขณะ push ให้เข้าสู่ระบบ GitHub ตามที่ Git ขอ ไม่ใส่ token ลงใน source code

3. เปิด repository → Settings → Pages
4. ใต้ Build and deployment เลือก Source เป็น **GitHub Actions**
5. ไปที่ Actions → Deploy to GitHub Pages หากการรันแรกไม่สำเร็จเพราะยังไม่เปิด Pages ให้เลือก Run workflow → main → Run workflow
6. เมื่อ build และ deploy เป็นสีเขียว ให้เปิด URL จาก Settings → Pages หรือ job deploy โดยทั่วไปคือ `https://YOUR_USERNAME.github.io/expense-tracker/`

หลังจากแก้โค้ด ให้ commit และ push ไปที่ `main` อีกครั้ง ระบบจะ build และ deploy เวอร์ชันใหม่อัตโนมัติ ไฟล์ `.github/workflows/deploy.yml` ต้องอยู่ใน repository ด้วย อย่าอัปโหลดเฉพาะ `src`

**สถานะของไฟล์ชุดนี้:** เตรียม workflow สำหรับ GitHub Pages แล้ว ยังไม่ได้ push ไปยังบัญชี GitHub หรือเผยแพร่เว็บไซต์จริง

## โครงสร้างโปรเจกต์

```text
expense-tracker/
  .github/workflows/deploy.yml  Workflow สำหรับ GitHub Pages
  public/favicon.svg           ไอคอนเว็บไซต์
  src/App.jsx                  Layout, Routes และข้อมูลที่ใช้ร่วมกัน
  src/LedgerContext.jsx        Context สำหรับข้อมูลและการบันทึก
  src/pages/OverviewPage.jsx   หน้าสรุปยอดและกราฟ
  src/pages/TransactionsPage.jsx  หน้าค้นหา แก้ไข และลบ
  src/pages/EntryPage.jsx      หน้าเพิ่มและแก้ไขรายการ
  src/components/CategoryIcon.jsx  ไอคอนหมวดหมู่
  src/database.js              IndexedDB และ CRUD
  src/ledger.js                หมวดหมู่ การตรวจสอบ และการคำนวณ
  src/index.css                Tailwind CSS และสไตล์
  src/main.jsx                 จุดเริ่มต้น React
  tests/                       ทดสอบข้อมูลและการคำนวณ
  index.html
  package.json
  package-lock.json
  vite.config.js
```

## ตรวจสอบข้อมูลเพื่อสาธิตให้อาจารย์

1. เปิดเว็บ → กด F12 → Application (Chrome / Edge)
2. เปิด Storage → IndexedDB → expense-tracker-db → transactions เพื่อดูรายการ
3. เปิด Local Storage → URL ของเว็บ เพื่อดูเดือนที่บันทึกไว้
4. กดเมนูเพิ่มรายการ แล้วเพิ่มรายรับ 1,000 บาท และรายจ่าย 100 บาทในเดือนเดียวกัน ยอดคงเหลือควรเป็น 900 บาท
5. รีเฟรชหน้า ข้อมูลควรยังอยู่
6. แก้จำนวนเงินและลบรายการ แล้วตรวจสอบว่ายอดเปลี่ยนตามจริง

## เอกสารอ้างอิง

- https://reactrouter.com/api/declarative-routers/HashRouter
- https://tailwindcss.com/docs/installation/using-vite
- https://vite.dev/guide/static-deploy
- https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
