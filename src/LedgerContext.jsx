import { createContext, useContext } from 'react'

export const LedgerContext = createContext(null)

export function useLedger() {
  const context = useContext(LedgerContext)
  if (!context) throw new Error('useLedger must be used inside LedgerContext')
  return context
}
