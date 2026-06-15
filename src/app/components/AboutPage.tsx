import { Heart, Star, Users, Package } from "lucide-react";

type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'dashboard' | 'admin' | 'login' | 'register' | 'about' | 'contact';

export function AboutPage({ navigate }: { navigate: (page: Page) => void }) {
  const team = [
    { name: 'Priya Mehta', role: 'Founder & CEO', emoji: '👩‍💼', bio: 'Craft enthusiast turned entrepreneur. Passionate about making quality supplies accessible to everyone.' },
    { name: 'Rohan Kumar', role: 'Head of Operations', emoji: '👨‍💻', bio: 'Logistics wizard who ensures your orders reach you faster than you can tie a knot.' },
    { name: 'Sneha Iyer', role: 'Creative Director', emoji: '🎨', bio: 'Artist and crafter who curates every product in our catalog with love and expertise.' },
    { name: 'Arjun Sharma', role: 'Community Manager', emoji: '🌟', bio: 'Connects crafters across India and fosters the vibrant Lemon House community.' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF7' }}>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff0f8, #FFFDF7)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-6xl mb-5">🍋</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#D81B8A' }}>
            Our Story
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            What started as a personal struggle to find quality craft supplies in India became a mission to empower every crafter to create without limits.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl border-2 border-primary/20" style={{ background: '#fff0f8' }}>
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#D81B8A' }}>Our Mission</h2>
              <p className="text-foreground/70 leading-relaxed">
                To make premium craft supplies accessible, affordable, and inspiring for every crafter in India — from the beginner discovering their first hobby to the professional artisan building a business.
              </p>
            </div>
            <div className="p-8 rounded-3xl border-2 border-accent/20" style={{ background: '#f0faf0' }}>
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#2E7D32' }}>Our Vision</h2>
              <p className="text-foreground/70 leading-relaxed">
                A world where creativity knows no boundaries — where every person has access to the tools, materials, and community they need to bring their creative vision to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14" style={{ background: 'linear-gradient(135deg, #D81B8A, #c0156e)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
            {[
              { Icon: Package, value: '1,000+', label: 'Products Curated' },
              { Icon: Users, value: '50,000+', label: 'Happy Crafters' },
              { Icon: Star, value: '4.9/5', label: 'Average Rating' },
              { Icon: Heart, value: '200+', label: 'Cities Served' },
            ].map(({ Icon, value, label }) => (
              <div key={label}>
                <Icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>From a Bengaluru Apartment to 200+ Cities</h2>
              <div className="space-y-4 text-foreground/70 leading-relaxed">
                <p>In 2020, Priya Mehta was frustrated. As a passionate crafter, she kept running into the same problem: quality craft supplies in India were either impossible to find or outrageously expensive. She was importing materials from overseas, paying huge shipping costs, and waiting weeks for her supplies to arrive.</p>
                <p>She knew she wasn't alone. Across India, thousands of crafters faced the same challenge. So she decided to do something about it. From her apartment in Koramangala, Bengaluru, she launched Lemon House with just 50 products and a vision.</p>
                <p>Today, Lemon House stocks over 1,000 premium craft products, ships to 200+ cities across India, and has become home to a community of 50,000+ passionate crafters. Every product is personally tested by our craft team before it reaches you.</p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-muted">
                <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&h=500&fit=crop&auto=format" alt="Craft studio" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-border">
                <p className="text-2xl font-bold" style={{ color: '#D81B8A', fontFamily: 'Poppins, sans-serif' }}>2020</p>
                <p className="text-xs text-muted-foreground">Founded in Bengaluru</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16" style={{ background: '#FFFDF7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Meet the Team</h2>
            <p className="text-muted-foreground mt-2">The passionate people behind Lemon House</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map(member => (
              <div key={member.name} className="bg-white rounded-2xl border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mx-auto mb-3" style={{ background: '#FCE4EC' }}>
                  {member.emoji}
                </div>
                <h3 className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{member.name}</h3>
                <p className="text-xs text-primary font-semibold mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Join Our Craft Community</h2>
          <p className="text-muted-foreground mb-6">Thousands of crafters are creating beautiful things every day. Be part of our story.</p>
          <button onClick={() => navigate('shop')} className="px-8 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #D81B8A, #e91ea0)' }}>
            Start Shopping
          </button>
        </div>
      </section>
    </div>
  );
}
