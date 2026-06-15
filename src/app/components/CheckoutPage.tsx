import { useState } from "react";
import { Check, ChevronRight, MapPin, Truck, CreditCard, ClipboardList, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../data";

type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'dashboard' | 'admin' | 'login' | 'register' | 'about' | 'contact';

type CheckoutProps = {
  items: CartItem[];
  navigate: (page: Page) => void;
  onOrderComplete: () => void;
};

type Step = 'shipping' | 'delivery' | 'payment' | 'review' | 'confirmed';

const STEPS = [
  { key: 'shipping', label: 'Shipping', Icon: MapPin },
  { key: 'delivery', label: 'Delivery', Icon: Truck },
  { key: 'payment', label: 'Payment', Icon: CreditCard },
  { key: 'review', label: 'Review', Icon: ClipboardList },
] as const;

export function CheckoutPage({ items, navigate, onOrderComplete }: CheckoutProps) {
  const [step, setStep] = useState<Step>('shipping');
  const [form, setForm] = useState({
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    address: '42, 3rd Cross, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    deliveryMethod: 'standard',
    paymentMethod: 'upi',
  });

  const stepIndex = STEPS.findIndex(s => s.key === step);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = form.deliveryMethod === 'express' ? 99 : subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const placeOrder = () => {
    setStep('confirmed');
    onOrderComplete();
  };

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF7' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-6 py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #388e3c)' }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#2E7D32' }}>
            Order Placed! 🎉
          </h2>
          <p className="text-muted-foreground mb-2">Your order <strong>#LH-2848</strong> has been placed successfully.</p>
          <p className="text-sm text-muted-foreground mb-8">Expected delivery: <strong>Jun 14–15, 2026</strong></p>

          <div className="bg-white rounded-2xl border border-border p-5 mb-8 text-left space-y-3">
            <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-muted" />
                <div className="flex-1">
                  <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} · ₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex justify-between font-bold text-sm">
              <span>Total Paid</span><span>₹{total}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('dashboard')}
              className="w-full py-3 rounded-2xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #D81B8A, #e91ea0)' }}
            >
              Track Order
            </button>
            <button
              onClick={() => navigate('shop')}
              className="w-full py-3 rounded-2xl text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF7' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Checkout</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const current = STEPS.findIndex(x => x.key === step);
            const done = i < current;
            const active = i === current;
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    done ? 'bg-accent' : active ? 'bg-primary' : 'bg-muted border border-border'
                  }`}>
                    {done ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <s.Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${active ? 'text-primary' : done ? 'text-accent' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-12 sm:w-20 mx-2 mb-4 transition-all ${i < current ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-6">
              <AnimatePresence mode="wait">
                {step === 'shipping' && (
                  <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Shipping Address</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', key: 'name', type: 'text', col: 'sm:col-span-2' },
                        { label: 'Phone Number', key: 'phone', type: 'tel', col: '' },
                        { label: 'Pin Code', key: 'pincode', type: 'text', col: '' },
                        { label: 'Address', key: 'address', type: 'text', col: 'sm:col-span-2' },
                        { label: 'City', key: 'city', type: 'text', col: '' },
                        { label: 'State', key: 'state', type: 'text', col: '' },
                      ].map(f => (
                        <div key={f.key} className={f.col}>
                          <label className="block text-sm font-semibold mb-1.5">{f.label}</label>
                          <input
                            type={f.type}
                            value={form[f.key as keyof typeof form]}
                            onChange={e => updateForm(f.key, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 'delivery' && (
                  <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Delivery Method</h2>
                    <div className="space-y-3">
                      {[
                        { value: 'standard', label: 'Standard Delivery', sub: '3–5 business days', price: subtotal > 499 ? 'FREE' : '₹49' },
                        { value: 'express', label: 'Express Delivery', sub: '1–2 business days', price: '₹99' },
                      ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          form.deliveryMethod === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}>
                          <input type="radio" name="delivery" value={opt.value} checked={form.deliveryMethod === opt.value} onChange={e => updateForm('deliveryMethod', e.target.value)} className="accent-primary" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.sub}</p>
                          </div>
                          <span className={`font-bold text-sm ${opt.price === 'FREE' ? 'text-accent' : ''}`}>{opt.price}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { value: 'upi', label: 'UPI', sub: 'Pay via GPay, PhonePe, Paytm', icon: '📱' },
                        { value: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                        { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive', icon: '💵' },
                      ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          form.paymentMethod === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}>
                          <input type="radio" name="payment" value={opt.value} checked={form.paymentMethod === opt.value} onChange={e => updateForm('paymentMethod', e.target.value)} className="accent-primary" />
                          <span className="text-xl">{opt.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.sub}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 'review' && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Review Order</h2>
                    <div className="space-y-3 mb-5">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-muted" />
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm space-y-1.5 p-4 bg-muted/30 rounded-xl">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Ship to</span><span className="font-medium text-foreground">{form.name}, {form.city}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery</span><span className="font-medium text-foreground capitalize">{form.deliveryMethod}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Payment</span><span className="font-medium text-foreground uppercase">{form.paymentMethod}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {stepIndex > 0 && (
                  <button
                    onClick={() => setStep(STEPS[stepIndex - 1].key as Step)}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-border hover:bg-muted transition-all"
                  >
                    Back
                  </button>
                )}
                {stepIndex < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(STEPS[stepIndex + 1].key as Step)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg, #D81B8A, #e91ea0)' }}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={placeOrder}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg, #2E7D32, #388e3c)' }}
                  >
                    <PartyPopper className="w-4 h-4" /> Place Order
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-2xl border border-border p-5 h-fit sticky top-24">
            <h3 className="font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Order Summary</h3>
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{item.name} ×{item.quantity}</span>
                  <span className="font-medium flex-shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>{shipping === 0 ? <span className="text-accent">FREE</span> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
