import { Instagram, Youtube, Twitter, Facebook, Mail, Phone, MapPin, Heart } from "lucide-react";

type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'dashboard' | 'admin' | 'login' | 'register' | 'about' | 'contact';

type FooterProps = {
  navigate: (page: Page) => void;
};

export function Footer({ navigate }: FooterProps) {
  return (
    <footer style={{ background: '#1a1a2e' }} className="text-white">
      {/* Newsletter */}
      <div style={{ background: 'linear-gradient(135deg, #D81B8A, #c0156e)' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl mb-3">🍋</div>
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Join the Lemon House Community
          </h3>
          <p className="text-white/80 mb-6 text-sm">
            Get exclusive deals, craft inspiration, and early access to new arrivals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
            <button className="px-6 py-3 bg-white text-primary rounded-xl font-semibold text-sm hover:bg-secondary transition-all hover:text-foreground">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #D81B8A, #e91ea0)' }}>
                  🍋
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span style={{ color: '#D81B8A' }}>Lemon</span>
                  <span style={{ color: '#66bb6a' }}>House</span>
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Your one-stop destination for premium craft supplies, DIY materials, and creative essentials.
              </p>
              <div className="flex gap-3">
                {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Home', page: 'home' as Page },
                  { label: 'Shop', page: 'shop' as Page },
                  { label: 'About Us', page: 'about' as Page },
                  { label: 'Contact', page: 'contact' as Page },
                ].map(item => (
                  <li key={item.page}>
                    <button
                      onClick={() => navigate(item.page)}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: 'Poppins, sans-serif' }}>Categories</h4>
              <ul className="space-y-2.5">
                {['Resin Supplies', 'Beads & Stones', 'Art Supplies', 'Embroidery', 'DIY Kits', 'Jewelry Making'].map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => navigate('shop')}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: 'Poppins, sans-serif' }}>Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  42 Craft Lane, Koramangala, Bengaluru – 560034
                </li>
                <li className="flex items-center gap-2.5 text-white/60 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-2.5 text-white/60 text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                  hello@lemonhouse.in
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">© 2026 Lemon House. All rights reserved.</p>
            <p className="text-white/40 text-sm flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-primary fill-current" /> for crafters everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
