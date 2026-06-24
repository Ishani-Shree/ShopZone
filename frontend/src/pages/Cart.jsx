import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, removeFromCart, checkout } from '../api'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import Toast from '../components/Toast'
import { Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react'

export default function Cart() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [toast, setToast] = useState(null)
  const { refreshCart } = useCart()
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()

  const fetchCart = useCallback(async () => {
    try {
      const res = await getCart()
      setItems(res.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      await refreshCart()
    } catch {
      setToast({ message: 'Failed to remove item', type: 'error' })
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      const res = await checkout()
      setItems([])
      await refreshCart()
      navigate(`/payment/${res.data.order.id}`)
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Checkout failed', type: 'error' })
    } finally {
      setCheckingOut(false)
    }
  }

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingCart size={24} /> Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="card text-center py-16 px-8">
          <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some products to get started.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-indigo-500 font-bold text-xl">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                <p className="text-sm text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900">
                  {formatPrice(parseFloat(item.price) * item.quantity)}
                </p>
                <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 transition-colors mt-1" title="Remove">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <div className="card p-6 mt-6">
            <div className="flex justify-between items-center text-lg font-bold mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button onClick={handleCheckout} disabled={checkingOut} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
              {checkingOut ? 'Placing order…' : <> Place Order <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
