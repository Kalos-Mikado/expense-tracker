import 'fake-indexeddb/auto'
import test from 'node:test'
import assert from 'node:assert/strict'
import { addRecord, updateRecord, removeRecord, listRecords } from '../src/database.js'

test('IndexedDB CRUD, duplicates, and updates after removal', async () => {
  assert.deepEqual(await listRecords(), [])
  const record = { id: 'income-1', type: 'income', title: 'งานเสริม', amount: 10001, category: 'งานเสริม', date: '2026-10-07', note: '' }
  await addRecord(record)
  assert.deepEqual(await listRecords(), [record])
  await assert.rejects(addRecord(record))
  assert.equal((await listRecords()).length, 1)
  await updateRecord({ ...record, amount: 20002 })
  assert.equal((await listRecords())[0].amount, 20002)
  await assert.rejects(addRecord({ ...record, id: 'bad', amount: -1 }))
  await removeRecord(record.id)
  assert.deepEqual(await listRecords(), [])
  await assert.rejects(updateRecord(record), /no longer exists/)
  assert.deepEqual(await listRecords(), [])
})

test('concurrent inserts retain both records', async () => {
  const base = { type: 'expense', title: 'อาหาร', amount: 6000, category: 'อาหารและเครื่องดื่ม', date: '2026-10-07', note: '' }
  await Promise.all([addRecord({ ...base, id: 'a' }), addRecord({ ...base, id: 'b' })])
  assert.deepEqual((await listRecords()).map(record => record.id).sort(), ['a', 'b'])
  await removeRecord('a')
  await removeRecord('b')
})
