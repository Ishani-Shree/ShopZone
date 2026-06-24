import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders, cancelOrder } from '../api'
import { useCurrency } from '../context/CurrencyContext'
import { StatusBadge } from './PaymentPage'
import Toast from '../components/Toast'
import { Package, ChevronRight, ShoppingBag, CreditCard, XCircle } from 'lucide-react'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (orderId) => {
    setCancelling(orderId)
    try {
      const res = await cancelOrder(orderId)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data.order : o)))
      setToast({ message: `Order #${orderId} cancelled`, type: 'success' })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error
        || (err.response?.status ? `Server error ${err.response.status}` : 'Network error — is the server running?')
      setToast({ message: msg, type: 'error' })
    } finally {
      setCancelling(null)
      setConfirm(null)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package size={24} /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="card text-center py-16 px-8">
          <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Your order history will appear here.</p>
          <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Package size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">Order #{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{formatPrice(order.total_price)}</p>
                </div>
              </div>

              {/* action row */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                <Link
                  to={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  View Details <ChevronRight size={15} />
                </Link>

                {order.status === 'pending_payment' && (
                  <Link
                    to={`/payment/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CreditCard size={14} /> Pay Now
                  </Link>
                )}

                {order.status !== 'cancelled' && (
                  <button
                    onClick={() => setConfirm(order.id)}
                    className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* cancel confirmation modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cancel Order #{confirm}?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Items will be restocked and the order cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Keep
              </button>
              <button
                onClick={() => handleCancel(confirm)}
                disabled={cancelling === confirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {cancelling === confirm ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
