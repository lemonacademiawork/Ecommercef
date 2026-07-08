import {
  Instagram,
  Youtube,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

const WhatsApp = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M17.49 15.3a1.55 1.55 0 0 1-1 1.54 3.76 3.76 0 0 1-2.39-.75 14.66 14.66 0 0 1-4.79-4.79 3.74 3.74 0 0 1-.75-2.38 1.56 1.56 0 0 1 1.54-1h1.16a1 1 0 0 1 .99.82 7.74 7.74 0 0 0 .41 1.63 1 1 0 0 1-.22 1L11.89 11a1 1 0 0 0 0 1l.71.71a1 1 0 0 0 1 0l.74-.74a1 1 0 0 1 1-.22 7.8 7.8 0 0 0 1.63.41 1 1 0 0 1 .82.99v1.15z" />
    <path d="M22 12A10 10 0 0 1 12 22a9.9 9.9 0 0 1-4.54-1.1L3 21l1.1-4.54A10 10 0 1 1 22 12z" />
  </svg>
);

export function Footer({ navigate }) {
  return (
    <footer style={{ background: "#1a1a2e" }} className="text-white">
      {/* Newsletter */}
      <div
        style={{ background: "linear-gradient(135deg, #7b1fa2, #e91e63)" }}
        className="py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src={logoImg}
            alt="Lemon House Logo"
            className="w-14 h-14 object-contain mx-auto mb-3 rounded-full bg-white/10 p-0.5"
          />
          <h3
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Join the Lemon House Community
          </h3>
          <p className="text-white/80 mb-6 text-sm">
            Get exclusive deals, craft inspiration, and early access to new
            arrivals.
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
                <img
                  src={logoImg}
                  alt="Lemon House Logo"
                  className="w-8 h-8 object-contain"
                />
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <span style={{ color: "#bd127c" }}>Lemon</span>
                  <span style={{ color: "#1b5e20" }}>House</span>
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Your one-stop destination for premium craft supplies, DIY
                materials, and creative essentials.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: Instagram, href: "https://www.instagram.com/lemon_academia__?igsh=MW91bmp1eDN6N2xhbA==" },
                  { Icon: Facebook, href: "https://www.facebook.com/share/18uE5qyVBg/" },
                  { Icon: Youtube, href: "https://www.youtube.com/@Lemonacademia_in" },
                  { Icon: WhatsApp, href: "https://whatsapp.com/channel/0029VbBY7JXFMqrOLLRraZ3m" },
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className="font-semibold mb-4 text-white/90"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Home", page: "home" },
                  { label: "Shop", page: "shop" },
                  { label: "About Us", page: "about" },
                  { label: "Contact", page: "contact" },
                ].map((item) => (
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
              <h4
                className="font-semibold mb-4 text-white/90"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Categories
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Resin Supplies",
                  "Beads & Stones",
                  "Art Supplies",
                  "DIY Kits",
                ].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => navigate("shop")}
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
              <h4
                className="font-semibold mb-4 text-white/90"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Contact Us
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-white/60 text-sm min-w-0">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="break-words">Ritu Bihar Colony near rai atta chakki infront of radha rani tent house Jhansi</span>
                </li>
                <li className="flex items-start gap-2.5 text-white/60 text-sm min-w-0">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="break-all">
                    +91 9648886556
                    <br />
                    +91 9450860884
                  </span>
                </li>
                <li className="flex items-center gap-2.5 text-white/60 text-sm min-w-0">
                  <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                  <span className="break-all">lemonacademia.in@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2026 Lemon House. All rights reserved.
            </p>
            <p className="text-white/40 text-sm flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-primary fill-current" />{" "}
              for crafters everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
