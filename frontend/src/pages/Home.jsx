import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getProducts, searchProducts, addToCart } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import Toast from '../components/Toast'
import { ShoppingBag } from 'lucide-react'

// Large enough to fetch all products in one shot
const LIMIT = 200

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = q
        ? await searchProducts(q)
        : await getProducts(1, LIMIT)
      setProducts(res.data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleAddToCart = async (product) => {
    if (!user) { navigate('/login'); return }
    try {
      await addToCart(product.id, 1)
      await refreshCart()
      setToast({ message: `${product.name} added to cart!`, type: 'success' })
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to add to cart', type: 'error' })
    }
  }

  const SkeletonCard = () => (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-9 bg-gray-200 rounded-lg mt-4" />
      </div>
    </div>
  )

  // Group by category when not searching
  const categories = q ? null : [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero */}
      {!q && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 mb-10 text-white">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Shop the latest products</h1>
            <p className="text-blue-100 text-lg">Browse {products.length > 0 ? products.length : ''} products across {categories?.length || ''} categories. Fast checkout, easy returns.</p>
          </div>
        </div>
      )}

      {/* Search results heading */}
      {q && !loading && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {products.length === 0 ? `No results for "${q}"` : `${products.length} result${products.length !== 1 ? 's' : ''} for "${q}"`}
          </h2>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No products found</p>
          {q && <p className="text-gray-400 text-sm mt-1">Try a different search term</p>}
        </div>
      ) : q ? (
        // Flat grid for search results
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        // Grouped by category
        <div className="space-y-12">
          {categories.map((cat) => {
            const catProducts = products.filter(p => p.category === cat)
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-bold text-gray-900">{cat}</h2>
                  <span className="text-sm text-gray-400 font-medium">{catProducts.length} items</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {catProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
