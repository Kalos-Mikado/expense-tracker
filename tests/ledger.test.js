import test from 'node:test'
import assert from 'node:assert/strict'
import { parseAmount, summarize, isDate, validateRecord } from '../src/ledger.js'

test('money keeps satang exact and rejects invalid amounts', () => {
  assert.equal(parseAmount('0.10') + parseAmount('0.20'), 30)
  assert.equal(parseAmount('199.9'), 19990)
  assert.equal(parseAmount('999999999.99'), 99999999999)
  for (const value of ['0', '-1', 'NaN', '1e3', '1.001', '', '1000000000']) {
    assert.equal(parseAmount(value), null)
  }
})

test('summary handles expenses greater than income', () => {
  assert.deepEqual(summarize([{ type: 'income', amount: 1000 }, { type: 'expense', amount: 1200 }]), { income: 1000, expense: 1200, balance: -200 })
  assert.deepEqual(summarize([]), { income: 0, expense: 0, balance: 0 })
})

test('dates and categories must be valid', () => {
  assert.equal(isDate('2024-02-29'), true)
  assert.equal(isDate('2025-02-29'), false)
  assert.equal(isDate('2026-13-01'), false)
  assert.equal(isDate('2026-02-31'), false)
  const record = { id: 'test', type: 'income', title: 'เงินเดือน', amount: 10000, category: 'เงินเดือน', date: '2026-10-07', note: '' }
  assert.equal(validateRecord(record), true)
  assert.equal(validateRecord({ ...record, category: 'เดินทาง' }), false)
  assert.equal(validateRecord({ ...record, amount: 1.5 }), false)
})
