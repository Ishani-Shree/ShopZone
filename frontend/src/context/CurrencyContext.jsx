import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext(null)

// Prices in DB are stored in INR — this is the base currency
const FALLBACK = { code: 'INR', rate: 1, locale: 'en-IN' }

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(FALLBACK)
  const [detecting, setDetecting] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function detect() {
      try {
        // Step 1 — get country + currency code from IP
        const geoRes = await fetch('https://ipwho.is/')
        const geo = await geoRes.json()
        const code = geo?.currency?.code
        const locale = geo?.country ? `${geo.languages?.split(',')[0] || 'en'}-${geo.country}` : 'en-IN'

        if (!code || code === 'INR') {
          if (!cancelled) setCurrency(FALLBACK)
          return
        }

        // Step 2 — get INR → local currency rate
        const rateRes = await fetch('https://open.er-api.com/v6/latest/INR')
        const rateData = await rateRes.json()
        const rate = rateData?.rates?.[code]

        if (!cancelled && rate) {
          setCurrency({ code, rate, locale })
        }
      } catch {
        // silently fall back to INR
      } finally {
        if (!cancelled) setDetecting(false)
      }
    }

    detect()
    return () => { cancelled = true }
  }, [])

  const formatPrice = (inrPrice) => {
    const amount = parseFloat(inrPrice) * currency.rate
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        maximumFractionDigits: currency.code === 'JPY' || currency.code === 'KRW' ? 0 : 2,
      }).format(amount)
    } catch {
      return `${currency.code} ${amount.toFixed(2)}`
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice, detecting }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
