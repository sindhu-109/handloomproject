import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import products from '../data/products.json'

function Home({ onAddToCart }) {
  const featuredProducts = products.slice(0, 6)
  const categories = [
    { 
      name: 'Clothing', 
      slug: 'clothing',
      icon: '👕', 
      description: 'Handwoven sarees, kurtas, shawls, and stoles',
      count: products.filter(p => p.category === 'clothing').length
    },
    { 
      name: 'Bags', 
      slug: 'bags',
      icon: '👜', 
      description: 'Eco-friendly handloom tote bags, purses, and sling bags',
      count: products.filter(p => p.category === 'bags').length
    },
    { 
      name: 'Home Décor', 
      slug: 'homedecor',
      icon: '🏠', 
      description: 'Cushions, curtains, table runners, and handmade mats',
      count: products.filter(p => p.category === 'homedecor').length
    },
    { 
      name: 'Wall Art', 
      slug: 'wall-art',
      icon: '🎨', 
      description: 'Traditional fabric art, framed weaves, and tapestries',
      count: products.filter(p => p.category === 'wall-art').length
    },
    { 
      name: 'Accessories', 
      slug: 'accessories',
      icon: '🧣', 
      description: 'Scarves, jewelry, and handcrafted belts',
      count: products.filter(p => p.category === 'accessories').length
    },
    { 
      name: 'Lifestyle & Gifts', 
      slug: 'lifestyle-gifts',
      icon: '🧺', 
      description: 'Sustainable gift sets, journals, and daily-use crafts',
      count: products.filter(p => p.category === 'lifestyle-gifts').length
    }
  ]

  return (
    <div className="home-page">
      <HeroSection />
      
      <div className="content">
        {/* Categories Section */}
        <section className="categories-section">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <a key={index} className="category-card" href={`/products?category=${encodeURIComponent(category.slug)}`}>
                <span className="category-icon">{category.icon}</span>
                <h3>{category.name}</h3>
                <p className="category-description">{category.description}</p>
                {category.count > 0 && (
                  <span className="category-count">{category.count} products</span>
                )}
              </a>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="featured-products" id="featured">
          <h2 className="section-title">Our Handloom Collection</h2>
          <p className="section-subtitle">Authentic handcrafted products from skilled artisans across India</p>
          <div className="products-grid">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} onAdd={onAddToCart} />
            ))}
          </div>
          <div className="section-footer">
            <a href="/products" className="btn btn-outline">Explore More Products</a>
          </div>
        </section>

        {/* Regional Specialties Section */}
        <section className="regional-specialties">
          <h2 className="section-title">Regional Handloom Specialties</h2>
          <p className="section-subtitle">Discover the unique weaving traditions from across India</p>
          <div className="specialties-grid">
            <div className="specialty-card banarasi-silk">
              <div className="specialty-overlay">
                <h3>Banarasi Silk</h3>
                <p className="specialty-location">Uttar Pradesh</p>
                <p className="specialty-description">Famous for luxurious silk sarees with intricate gold and silver zari work.</p>
              </div>
            </div>
            <div className="specialty-card kanchipuram-silk">
              <div className="specialty-overlay">
                <h3>Kanchipuram Silk</h3>
                <p className="specialty-location">Tamil Nadu</p>
                <p className="specialty-description">Renowned for vibrant colors and rich temple-inspired designs on silk sarees.</p>
              </div>
            </div>
            <div className="specialty-card pochampally-ikat">
              <div className="specialty-overlay">
                <h3>Pochampally Ikat</h3>
                <p className="specialty-location">Telangana</p>
                <p className="specialty-description">Recognized for geometric patterns created through tie-and-dye techniques.</p>
              </div>
            </div>
            <div className="specialty-card tant-saree">
              <div className="specialty-overlay">
                <h3>Tant Saree</h3>
                <p className="specialty-location">West Bengal</p>
                <p className="specialty-description">Lightweight cotton sarees with broad borders, perfect for daily wear.</p>
              </div>
            </div>
            <div className="specialty-card chanderi">
              <div className="specialty-overlay">
                <h3>Chanderi</h3>
                <p className="specialty-location">Madhya Pradesh</p>
                <p className="specialty-description">Elegant cotton and silk sarees with delicate motifs and glossy finish.</p>
              </div>
            </div>
            <div className="specialty-card patola">
              <div className="specialty-overlay">
                <h3>Patola</h3>
                <p className="specialty-location">Gujarat</p>
                <p className="specialty-description">Double Ikat weaving known for vibrant colors and complex designs.</p>
              </div>
            </div>
            <div className="specialty-card madhubani-textiles">
              <div className="specialty-overlay">
                <h3>Madhubani Textiles</h3>
                <p className="specialty-location">Bihar</p>
                <p className="specialty-description">Hand-painted or block-printed fabrics featuring folk art motifs.</p>
              </div>
            </div>
            <div className="specialty-card kullu-handloom">
              <div className="specialty-overlay">
                <h3>Kullu Handloom</h3>
                <p className="specialty-location">Himachal Pradesh</p>
                <p className="specialty-description">Woolen shawls, caps, and stoles with bright stripes and geometric patterns.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Home


