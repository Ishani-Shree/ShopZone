import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { getOrder, cancelOrder } from '../api'
import { useCurrency } from '../context/CurrencyContext'
import { StatusBadge } from './PaymentPage'
import Toast from '../components/Toast'
import { ArrowLeft, CheckCircle, Package, CreditCard, XCircle } from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const justPaid = location.state?.justPaid
  const { formatPrice } = useCurrency()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchOrder = () => {
    setLoading(true)
    getOrder(id)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() }, [id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await cancelOrder(id)
      setData((prev) => ({ ...prev, order: res.data.order }))
      setShowConfirm(false)
      setToast({ message: 'Order cancelled successfully', type: 'success' })
    } catch (err) {
      setShowConfirm(false)
      const msg = err.response?.data?.message || err.response?.data?.error
        || (err.response?.status ? `Server error ${err.response.status}` : 'Network error — is the server running?')
      setToast({ message: msg, type: 'error' })
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="card p-6 space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-200 rounded" />)}
      </div>
    </div>
  )

  if (!data) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-gray-500">
      Order not found. <Link to="/orders" className="text-blue-600 hover:underline">Go back</Link>
    </div>
  )

  const { order, items } = data
  const canCancel = order.status !== 'cancelled'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      {/* payment success banner */}
      {justPaid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-green-800">
          <CheckCircle size={22} className="text-green-600 shrink-0" />
          <div>
            <p className="font-semibold">
              {order.status === 'confirmed' ? 'Order confirmed!' : 'Payment received!'}
            </p>
            <p className="text-sm text-green-700">Thank you for your purchase.</p>
          </div>
        </div>
      )}

      {/* order header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Package size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex gap-3 mt-5 flex-wrap">
          {order.status === 'pending_payment' && (
            <Link
              to={`/payment/${order.id}`}
              className="btn-primary inline-flex items-center gap-2 py-2 px-4 text-sm"
            >
              <CreditCard size={15} /> Pay Now
            </Link>
          )}
          {canCancel && (
            <button
              onClick={() => setShowConfirm(true)}
              className="btn-danger inline-flex items-center gap-2 py-2 px-4 text-sm"
            >
              <XCircle size={15} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* cancel confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cancel this order?</h2>
            <p className="text-gray-500 text-sm mb-6">
              This will cancel Order #{order.id} and restore the items to stock. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* items table */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-center">Qty</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
                <td className="px-6 py-4 text-right text-gray-600">{formatPrice(item.price)}</td>
                <td className="px-6 py-4 text-right font-semibold">
                  {formatPrice(parseFloat(item.price) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-xl font-black text-gray-900">{formatPrice(order.total_price)}</span>
        </div>
      </div>

      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        Continue Shopping
      </Link>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
