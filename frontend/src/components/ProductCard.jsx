import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

const GRADIENTS = [
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-green-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-cyan-400 to-blue-500',
]

export default function ProductCard({ product, onAddToCart }) {
  const { formatPrice } = useCurrency()
  const gradient = GRADIENTS[product.id % GRADIENTS.length]

  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div
          className={`w-full h-48 bg-gradient-to-br ${gradient} items-center justify-center hidden`}
        >
          <span className="text-white text-5xl font-bold opacity-30">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
            {product.category}
          </span>
        )}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="btn-primary mt-3 flex items-center justify-center gap-2 w-full text-sm"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
