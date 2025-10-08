function Cart({ cart, onCheckout }) {
  const items = Object.values(cart || {})
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  return (
    <div className="content">
      <h1>Cart</h1>
      {items.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          <ul>
            {items.map(item => (
              <li key={item.id}>{item.name} × {item.qty} — ${Number(item.price * item.qty).toFixed(2)}</li>
            ))}
          </ul>
          <p><strong>Total: ${Number(total).toFixed(2)}</strong></p>
          <button className="add" onClick={onCheckout}>Proceed to checkout</button>
        </>
      )}
    </div>
  )
}

export default Cart


