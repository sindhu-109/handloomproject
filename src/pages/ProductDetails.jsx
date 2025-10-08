import { useParams } from 'react-router-dom'
import products from '../data/products.json'

function ProductDetails({ onAddToCart }) {
  const { id } = useParams()
  const product = products.find(p => String(p.id) === String(id))
  if (!product) return <div className="content"><p>Product not found.</p></div>
  return (
    <div className="content" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
      <div>
        {product.image ? (
          <img src={product.image} alt={product.name} style={{width:'100%',borderRadius:8}} />
        ) : (
          <div className="thumb" style={{height:280}} aria-hidden="true">{product.emoji || '🧵'}</div>
        )}
      </div>
      <div>
        <h1>{product.name}</h1>
        {product.artisan ? <p>Artisan: <strong>{product.artisan}</strong></p> : null}
        {product.category ? <p>Category: {product.category}</p> : null}
        <p style={{fontSize:20,fontWeight:700}}>${Number(product.price).toFixed(2)}</p>
        {product.description ? <p>{product.description}</p> : null}
        <button className="add" onClick={() => onAddToCart(product)}>Add to cart</button>
      </div>
    </div>
  )
}

export default ProductDetails

