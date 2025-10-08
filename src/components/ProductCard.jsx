import { Link } from 'react-router-dom'

function ProductCard({ product, onAdd }) {
  return (
    <article className="card">
      <Link to={`/product/${product.id}`} className="thumb" aria-label={product.name}>
        {product.image ? <img src={product.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} /> : (product.emoji || '🧵')}
      </Link>
      <div className="info">
        <h2 className="name">{product.name}</h2>
        <div className="meta">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          {product.artisan ? <span style={{marginLeft:8,color:'#6b7280'}}>by {product.artisan}</span> : null}
        </div>
      </div>
      {onAdd ? (
        <button className="add" onClick={() => onAdd(product)}>Add to cart</button>
      ) : null}
    </article>
  )
}

export default ProductCard

