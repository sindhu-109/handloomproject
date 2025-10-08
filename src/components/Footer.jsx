function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>Handloom Heritage is dedicated to preserving traditional Indian craftsmanship and supporting artisan communities across the country.</p>
          <p>We connect skilled artisans with conscious consumers who value authentic, sustainable, and beautifully crafted handloom products.</p>
        </div>
        
        <div className="footer-section">
          <h3>Help & Support</h3>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/shipping">Shipping Information</a></li>
            <li><a href="/returns">Returns & Exchanges</a></li>
            <li><a href="/size-guide">Size Guide</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Consumer Policy</h3>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/refund">Refund Policy</a></li>
            <li><a href="/warranty">Warranty</a></li>
            <li><a href="/authenticity">Authenticity Guarantee</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <div className="contact-info">
            <p><strong>Email:</strong> <a href="mailto:support@handloomheritage.com">support@handloomheritage.com</a></p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Address:</strong><br />
            Handloom Heritage<br />
            123 Craft Street<br />
            Mumbai, Maharashtra 400001</p>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-media">
            <a href="#" className="social-link" aria-label="Facebook">
              <span className="social-icon">📘</span> Facebook
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <span className="social-icon">📷</span> Instagram
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <span className="social-icon">🐦</span> Twitter
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              <span className="social-icon">📺</span> YouTube
            </a>
            <a href="#" className="social-link" aria-label="Pinterest">
              <span className="social-icon">📌</span> Pinterest
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Handloom Heritage. All rights reserved.</p>
        <p className="footer-tagline">Preserving Tradition, Empowering Artisans</p>
      </div>
    </footer>
  )
}

export default Footer

