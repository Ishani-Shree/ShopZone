import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduct, addToCart } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import Toast from '../components/Toast'
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react'

const GRADIENTS = [
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-green-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-cyan-400 to-blue-500',
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const { formatPrice } = useCurrency()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getProduct(id)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, qty)
      await refreshCart()
      setToast({ message: 'Added to cart!', type: 'success' })
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed', type: 'error' })
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="rounded-2xl bg-gray-200 h-96" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-10 bg-gray-200 rounded-xl w-1/3 mt-6" />
          <div className="h-12 bg-gray-200 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  )

  if (!product) return null
  const gradient = GRADIENTS[product.id % GRADIENTS.length]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-100">
          {!imgError && product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-96 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white text-9xl font-black opacity-20">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">
              {product.category}
            </span>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{product.name}</h1>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          )}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-black text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {product.stock} in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-700 bg-red-100 px-3 py-1.5 rounded-full font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Out of stock
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button onClick={handleAddToCart} disabled={adding} className="btn-primary flex items-center justify-center gap-2 py-3 text-base">
                <ShoppingCart size={20} />
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
            </>
          )}
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
