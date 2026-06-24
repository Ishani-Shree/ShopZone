import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getOrder, payOrder } from '../api'
import { useCurrency } from '../context/CurrencyContext'
import { Lock, CreditCard, CheckCircle, Truck, ArrowLeft, AlertCircle } from 'lucide-react'

// ── helpers ─────────────────────────────────────────────────────────────────
const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExp  = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

const CARD_BRANDS = {
  '4': 'Visa',
  '5': 'Mastercard',
  '3': 'Amex',
  '6': 'Rupay',
}
const cardBrand = (num) => CARD_BRANDS[num[0]] || 'Card'

// ── status badge helper (reused across pages) ─────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending_payment: { label: 'Awaiting Payment', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    confirmed:       { label: 'Confirmed',         cls: 'bg-green-100  text-green-800  border-green-200'  },
    cancelled:       { label: 'Cancelled',         cls: 'bg-red-100    text-red-800    border-red-200'    },
  }
  const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700 border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}

// ── main component ───────────────────────────────────────────────────────────
export default function PaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  const [order, setOrder] = useState(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [stage, setStage] = useState('form')   // 'form' | 'processing' | 'success' | 'error'
  const [payMethod, setPayMethod] = useState('card')   // 'card' | 'cod'

  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getOrder(id)
      .then((res) => {
        if (res.data.order.status !== 'pending_payment') {
          navigate(`/orders/${id}`, { replace: true })
        } else {
          setOrder(res.data.order)
        }
      })
      .catch(() => navigate('/orders', { replace: true }))
      .finally(() => setLoadingOrder(false))
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    const formatted =
      name === 'number' ? fmtCard(value) :
      name === 'expiry' ? fmtExp(value)  :
      name === 'cvv'    ? value.replace(/\D/g, '').slice(0, 4) :
      value
    setForm((p) => ({ ...p, [name]: formatted }))
    setErrors((p) => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                          e.name   = 'Name on card is required'
    if (form.number.replace(/\s/g, '').length < 16) e.number = 'Enter a valid 16-digit card number'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry))       e.expiry = 'Enter expiry as MM/YY'
    if (form.cvv.length < 3)                        e.cvv    = 'CVV must be 3–4 digits'
    return e
  }

  const submit = async (method) => {
    if (method === 'card') {
      const errs = validate()
      if (Object.keys(errs).length) { setErrors(errs); return }
    }
    setProcessing(true)
    setStage('processing')
    setPayMethod(method)

    // simulate network + bank processing delay
    await new Promise((r) => setTimeout(r, method === 'cod' ? 1200 : 2800))

    try {
      await payOrder(id, method)
      setStage('success')
      setTimeout(() => navigate(`/orders/${id}`, { state: { justPaid: true } }), 2200)
    } catch {
      setStage('error')
      setProcessing(false)
    }
  }

  // ── loading ────────────────────────────────────────────────────────────────
  if (loadingOrder) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!order) return null

  // ── processing overlay ─────────────────────────────────────────────────────
  if (stage === 'processing') return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <div>
        <p className="text-xl font-bold text-gray-800">
          {payMethod === 'cod' ? 'Confirming your order…' : 'Processing payment…'}
        </p>
        <p className="text-gray-500 mt-1 text-sm">Please do not close this page</p>
      </div>
      {payMethod === 'card' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
          <Lock size={14} /> 256-bit SSL encrypted
        </div>
      )}
    </div>
  )

  // ── success screen ────────────────────────────────────────────────────────
  if (stage === 'success') return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle size={44} className="text-green-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {payMethod === 'cod' ? 'Order Confirmed!' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-500 mt-2">
          {payMethod === 'cod'
            ? 'Your order will be delivered. Pay when it arrives.'
            : `${formatPrice(order.total_price)} charged successfully.`}
        </p>
      </div>
      <p className="text-sm text-gray-400">Redirecting to your order…</p>
    </div>
  )

  // ── error screen ──────────────────────────────────────────────────────────
  if (stage === 'error') return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle size={44} className="text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
        <p className="text-gray-500 mt-2">Something went wrong. Please try again.</p>
      </div>
      <button onClick={() => setStage('form')} className="btn-primary">
        Try Again
      </button>
    </div>
  )

  // ── main payment form ────────────────────────────────────────────────────
  const digits = form.number.replace(/\s/g, '')

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">

      <Link to={`/orders/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to order
      </Link>

      {/* header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Lock size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-sm text-gray-500">Order #{order.id}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-black text-gray-900">{formatPrice(order.total_price)}</p>
        </div>
      </div>

      {/* ── card payment section ─────────────────────────────────────────── */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
          <CreditCard size={18} className="text-blue-600" /> Pay with Card
        </h2>

        {/* visual card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white mb-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <p className="text-xs font-medium text-blue-200 mb-4">{cardBrand(digits)}</p>
          <p className="font-mono text-lg tracking-widest mb-4">
            {form.number || '•••• •••• •••• ••••'}
          </p>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-blue-200 text-xs">Card Holder</p>
              <p className="font-medium truncate max-w-[140px]">{form.name || 'Your Name'}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Expires</p>
              <p className="font-medium">{form.expiry || 'MM/YY'}</p>
            </div>
          </div>
        </div>

        {/* inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ishani Shree"
              className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              className={`input font-mono tracking-wider ${errors.number ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                inputMode="numeric"
                className={`input font-mono ${errors.expiry ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="•••"
                inputMode="numeric"
                type="password"
                className={`input font-mono ${errors.cvv ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
            </div>
          </div>
        </div>

        <button
          onClick={() => submit('card')}
          disabled={processing}
          className="btn-primary w-full mt-6 py-3 text-base flex items-center justify-center gap-2"
        >
          <Lock size={16} /> Pay {formatPrice(order.total_price)}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
          <Lock size={11} /> Secured by 256-bit SSL encryption
        </p>
      </div>

      {/* ── divider ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── COD ──────────────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
            <Truck size={18} className="text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Cash on Delivery</p>
            <p className="text-xs text-gray-500">Pay when your order arrives</p>
          </div>
        </div>
        <button
          onClick={() => submit('cod')}
          disabled={processing}
          className="w-full py-3 rounded-xl border-2 border-orange-400 text-orange-700 font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
        >
          <Truck size={16} /> Confirm with Cash on Delivery
        </button>
      </div>

      {/* ── accepted payments ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
        {['Visa', 'Mastercard', 'Rupay', 'UPI', 'Net Banking'].map((p) => (
          <span key={p} className="px-3 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}
