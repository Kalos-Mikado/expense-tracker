import { validateRecord } from './ledger.js'

export const DATABASE_NAME = 'expense-tracker-db'
export const STORE_NAME = 'transactions'
let connection

export function openDatabase() {
  if (connection) return connection
  connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      store.createIndex('date', 'date')
      store.createIndex('type', 'type')
    }
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Database upgrade blocked'))
    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => { db.close(); connection = undefined }
      resolve(db)
    }
  }).catch(error => { connection = undefined; throw error })
  return connection
}

// Resolve after transaction completion, not merely after a request succeeds.
async function transact(mode, operation) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode)
    let result
    let operationError
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(operationError || transaction.error || new Error('Database write failed'))
    transaction.onabort = () => reject(operationError || transaction.error || new Error('Database transaction aborted'))
    try {
      operation(transaction.objectStore(STORE_NAME), value => { result = value }, error => {
        operationError = error
        transaction.abort()
      })
    } catch (error) {
      operationError = error
      transaction.abort()
    }
  })
}

export async function listRecords() {
  return transact('readonly', (store, done) => {
    const request = store.getAll()
    request.onsuccess = () => done(request.result)
  })
}

export async function addRecord(record) {
  if (!validateRecord(record)) throw new Error('Invalid record')
  return transact('readwrite', store => { store.add(record) })
}

export async function updateRecord(record) {
  if (!validateRecord(record)) throw new Error('Invalid record')
  return transact('readwrite', (store, done, abort) => {
    const request = store.get(record.id)
    request.onsuccess = () => {
      if (!request.result) { abort(new Error('Record no longer exists')); return }
      store.put(record)
    }
  })
}

export async function removeRecord(id) {
  return transact('readwrite', store => { store.delete(id) })
}
