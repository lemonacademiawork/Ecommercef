import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, ChevronDown } from "lucide-react";

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      q: "How long does delivery take?",
      a: "Standard delivery takes 3–5 business days. Express delivery (1–2 days) is available for an additional ₹99. Free delivery on orders above ₹499.",
    },
    {
      q: "What is your return policy?",
      a: "We offer a 7-day hassle-free return policy. Products must be unused and in original packaging. Initiate a return from your dashboard or contact our support team.",
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, we ship within India only. We're working on international shipping and will announce it soon!",
    },
    {
      q: "How can I track my order?",
      a: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track it from your customer dashboard.",
    },
    {
      q: "Are your products authentic/original?",
      a: "Yes! Every product is sourced directly from manufacturers or authorized distributors and tested by our craft team before listing.",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFFDF7" }}>
      {/* Hero */}
      <div
        className="py-14 text-center"
        style={{ background: "linear-gradient(135deg, #fff0f8, #FFFDF7)" }}
      >
        <h1
          className="text-4xl font-extrabold mb-2"
          style={{ fontFamily: "Poppins, sans-serif", color: "#D81B8A" }}
        >
          Contact Us
        </h1>
        <p className="text-muted-foreground">
          We'd love to hear from you. Reach out anytime!
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 mb-14">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2
              className="text-xl font-bold mb-5"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Send us a Message
            </h2>
            {sent ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="font-bold text-accent mb-1">Message sent!</h3>
                <p className="text-sm text-muted-foreground">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  {
                    label: "Your Name",
                    key: "name",
                    type: "text",
                    placeholder: "Priya Sharma",
                  },
                  {
                    label: "Email",
                    key: "email",
                    type: "email",
                    placeholder: "priya@example.com",
                  },
                  {
                    label: "Subject",
                    key: "subject",
                    type: "text",
                    placeholder: "Order enquiry, Return request, etc.",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      placeholder={f.placeholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #D81B8A, #e91ea0)",
                  }}
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2
                className="text-xl font-bold mb-5"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Get in Touch
              </h2>
              <div className="space-y-4">
                {[
                  {
                    Icon: MapPin,
                    label: "Our Store",
                    value:
                      "42 Craft Lane, Koramangala\nBengaluru, Karnataka – 560034",
                  },
                  {
                    Icon: Phone,
                    label: "Phone",
                    value: "+91 98765 43210\n+91 80 4567 8910",
                  },
                  {
                    Icon: Mail,
                    label: "Email",
                    value: "hello@lemonhouse.in\nsupport@lemonhouse.in",
                  },
                  {
                    Icon: Clock,
                    label: "Working Hours",
                    value: "Mon – Sat: 9 AM – 7 PM\nSun: 10 AM – 5 PM",
                  },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#FCE4EC" }}
                    >
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5">{label}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-semibold mb-3 text-sm">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { icon: "📸", label: "Instagram", handle: "@lemonhousein" },
                  {
                    icon: "▶️",
                    label: "YouTube",
                    handle: "Lemon House Crafts",
                  },
                  {
                    icon: "👥",
                    label: "Facebook",
                    handle: "Lemon House India",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex-1 text-center p-3 rounded-xl bg-muted hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="text-xs font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.handle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-semibold text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-3 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
