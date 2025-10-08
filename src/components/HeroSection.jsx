function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <h1>Crafted with Tradition, Woven with Love</h1>
          <p>Discover authentic handloom products from skilled artisans across India. Each piece tells a story of heritage, craftsmanship, and timeless beauty.</p>
          <div className="hero-actions">
            <a href="/products" className="btn btn-primary">Shop Now</a>
            <a href="#featured" className="btn btn-secondary">Explore Artisans</a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Artisans</span>
          </div>
          <div className="stat">
            <span className="stat-number">2000+</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat">
            <span className="stat-number">50+</span>
            <span className="stat-label">Regions</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection


