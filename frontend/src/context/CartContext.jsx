import { createContext, useContext, useState, useCallback } from 'react'
import { getCart } from '../api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0)

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setCartCount(0); return }
    try {
      const res = await getCart()
      setCartCount(res.data.length)
    } catch {
      setCartCount(0)
    }
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, setCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
