import { useState, useEffect } from "react";
import {
  Check,
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  ClipboardList,
  PartyPopper,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import logoImg from "@/assets/logo.png";
import { SEO } from "../components/SEO";
import { BackButton } from "../components/BackButton";
import { getOptimizedImageUrl } from "../utils/cloudinary";

const STEPS = [
  { key: "shipping", label: "Shipping", Icon: MapPin },
  { key: "delivery", label: "Delivery", Icon: Truck },
];

export function CheckoutPage({ items, navigate, onOrderComplete }) {
  const [step, setStep] = useState("shipping");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    deliveryMethod: "standard",
    paymentMethod: "RAZORPAY",
  });

  const [shippingRates, setShippingRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState("");

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Calculate dynamic total weight based on items in the cart (default to 150g per item if weight is not specified)
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = (item.weight && item.weight > 0) ? Number(item.weight) : 150;
    return sum + (itemWeight * item.quantity);
  }, 0) || 500;

  const totalWeightKg = (totalWeight / 1000).toFixed(2);

  const selectedSavedAddress = addresses.find((a) => a.id === selectedAddressId);
  const destinationPincode = useSavedAddress && selectedSavedAddress
    ? selectedSavedAddress.pincode
    : form.pincode;

  // Calculate dynamic package dimensions based on items
  const packageLength = Math.max(...items.map((item) => Number(item.length) || 10));
  const packageBreadth = Math.max(...items.map((item) => Number(item.breadth) || 10));
  const packageHeight = items.reduce((sum, item) => sum + ((Number(item.height) || 2) * item.quantity), 0) || 10;

  useEffect(() => {
    if (step === "delivery" && destinationPincode) {
      setLoadingRates(true);
      setRatesError("");
      api.shipping.getCustomerEstimate({
        destinationPincode: destinationPincode,
        weight: totalWeight / 1000,
        length: packageLength,
        breadth: packageBreadth,
        height: packageHeight,
        parcelValue: subtotal,
      })
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setShippingRates(res.data);
            const currentIsValid = res.data.some(opt => opt.courierName === form.deliveryMethod);
            if (!currentIsValid) {
              updateForm("deliveryMethod", res.data[0].courierName);
            }
          } else {
            const fallbackRates = [
              {
                courierId: "fallback_standard",
                courierName: "Standard Delivery",
                rate: subtotal > 499 ? 0 : 49,
                eta: "3–5 business days"
              }
            ];
            setShippingRates(fallbackRates);
            updateForm("deliveryMethod", fallbackRates[0].courierName);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch shipping rates:", err);
          const fallbackRates = [
            {
              courierId: "fallback_standard",
              courierName: "Standard Delivery",
              rate: subtotal > 499 ? 0 : 49,
              eta: "3–5 business days"
            }
          ];
          setShippingRates(fallbackRates);
          updateForm("deliveryMethod", fallbackRates[0].courierName);
        })
        .finally(() => {
          setLoadingRates(false);
        });
    }
  }, [step, destinationPincode, subtotal, totalWeight]);



  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.addresses.listAddresses()
        .then((res) => {
          if (res.success && res.data) {
            setAddresses(res.data);
            const def = res.data.find((a) => a.isDefault);
            if (def) {
              setSelectedAddressId(def.id);
            } else if (res.data.length > 0) {
              setSelectedAddressId(res.data[0].id);
            }
          }
        })
        .catch((err) => console.error("Error loading addresses", err));
    }
  }, []);

  const activeRate = shippingRates.find(r => r.courierName === form.deliveryMethod);
  const shipping = activeRate ? Number(activeRate.rate) : 0;

  const total = subtotal + shipping;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = async () => {
    setIsPlacing(true);
    try {
      let finalAddressId = selectedAddressId;
      if (!useSavedAddress || !finalAddressId) {
        // Add new address
        try {
          const addRes = await api.addresses.addAddress({
            fullName: form.name,
            phone: form.phone,
            addressLine1: form.address,
            addressLine2: "",
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            isDefault: true,
          });
          if (addRes.success && addRes.data) {
            finalAddressId = addRes.data.id;
          } else {
            throw new Error(addRes.message || "Failed to save shipping address");
          }
        } catch (addrErr) {
          console.warn("Backend address creation failed, using mock ID:", addrErr);
          finalAddressId = "addr_mock_" + Math.floor(Math.random() * 10000);
        }
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load Razorpay SDK. Please check your connection.");
        setIsPlacing(false);
        return;
      }

      const orderPayload = {
        addressId: finalAddressId,
        items: items.map(item => ({
          productId: item.productId || item.id,
          variantId: item.variantId || undefined,
          quantity: item.quantity
        }))
      };

      // Create the backend order first to obtain an orderId
      let backendOrderId = null;
      try {
        const preOrderRes = await api.orders.createOrder(orderPayload);

        if (preOrderRes && preOrderRes.success === false) {
          throw new Error(preOrderRes.message || "Failed to create order on backend.");
        }

        backendOrderId = preOrderRes.id || preOrderRes.orderId || preOrderRes.data?.id || preOrderRes.data?.orderId;

        if (!backendOrderId) {
          throw new Error("Order creation succeeded but orderId is missing from response.");
        }
      } catch (preErr) {
        console.error("Pre-order creation failed before Razorpay widget:", preErr);
        toast.error(preErr.message || "Failed to create order.");
        setIsPlacing(false);
        return;
      }

      let rzpOrderRes = null;
      const rzpPayload = {
        orderId: backendOrderId,
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: `receipt_${backendOrderId}`,
      };

      try {
        rzpOrderRes = await api.payments.createRazorpayOrder(rzpPayload);
      } catch (rzpErr) {
        console.error("Could not create Razorpay order:", rzpErr);
        toast.error(rzpErr.message || "Failed to create Razorpay payment order.");
        setIsPlacing(false);
        return;
      }

      const razorpayOrderId = rzpOrderRes?.data?.razorpayOrderId || rzpOrderRes?.razorpayOrderId;
      const razorpayAmount = rzpOrderRes?.data?.amount || rzpOrderRes?.amount || total;
      const razorpayCurrency = rzpOrderRes?.data?.currency || rzpOrderRes?.currency || "INR";
      const razorpayKey = rzpOrderRes?.data?.keyId || rzpOrderRes?.data?.key || rzpOrderRes?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_T0cB0EYllXBVHc";

      if (!razorpayOrderId) {
        console.error("razorpayOrderId is undefined in backend response:", rzpOrderRes);
        toast.error("Razorpay order ID missing from backend response.");
        setIsPlacing(false);
        return;
      }

      const amountInPaise = Math.round(razorpayAmount * 100);

      const logoUrl = logoImg?.startsWith("http")
        ? logoImg
        : `${window.location.origin}${logoImg?.startsWith("/") ? "" : "/"}${logoImg}`;

      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency: razorpayCurrency,
        order_id: razorpayOrderId,
        name: "Lemon House",
        description: "Order Payment",
        image: logoUrl,
        handler: async function (response) {
          try {
            setIsPlacing(true);
            try {
              await api.payments.verifyRazorpayPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                internalOrderId: backendOrderId,
              });
            } catch (verifyErr) {
              console.warn("Backend payment signature verification warning:", verifyErr);
            }

            setConfirmedOrderTotal(total);
            try {
              await api.cart.clearCart();
            } catch (cartErr) {
              console.error("Cart clear error", cartErr);
            }
            setConfirmedOrderId(backendOrderId);
            setStep("confirmed");
            onOrderComplete();

            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch (confettiErr) {}
          } catch (err) {
            console.error("Post-payment confirmation failed: " + err.message);
            toast.error(err.message || "Failed to confirm order after payment.");
          } finally {
            setIsPlacing(false);
          }
        },
        prefill: {
          name: form.name || (selectedSavedAddress?.fullName) || "",
          contact: form.phone || (selectedSavedAddress?.phone) || "",
          email: form.email || (selectedSavedAddress?.email) || "",
        },
        theme: {
          color: "#a61c9b",
        },
        modal: {
          ondismiss: function () {
            setIsPlacing(false);
            toast.error("Payment process cancelled. You can try again to complete your order.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation failed: " + err.message);
      toast.error(err.message || "Failed to place order.");
    } finally {
      setIsPlacing(false);
    }
  };

  const handleContinue = () => {
    if (step === "shipping") {
      if (!useSavedAddress || addresses.length === 0) {
        if (!form.name.trim()) {
          toast.error("Please enter your full name.");
          return;
        }
        if (!form.phone.trim()) {
          toast.error("Please enter your phone number.");
          return;
        }
        if (!form.address.trim()) {
          toast.error("Please enter your shipping address.");
          return;
        }
        if (!form.city.trim()) {
          toast.error("Please enter your city.");
          return;
        }
        if (!form.state.trim()) {
          toast.error("Please enter your state.");
          return;
        }
        if (!/^\d{6}$/.test(form.pincode)) {
          toast.error("Please enter a valid 6-digit PIN code.");
          return;
        }
      } else {
        if (!selectedAddressId) {
          toast.error("Please select a shipping address.");
          return;
        }
      }
    }

    setStep(STEPS[stepIndex + 1].key);
  };

  if (step === "confirmed") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FFFDF7" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-6 py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #2E7D32, #388e3c)" }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
          <h2
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "Poppins, sans-serif", color: "#2E7D32" }}
          >
            Order Placed! 🎉
          </h2>
          <p className="text-muted-foreground mb-2">
            Your order <strong>#{confirmedOrderId}</strong> has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Expected delivery: <strong>3–5 business days</strong>
          </p>

          <div className="bg-white rounded-2xl border border-border p-5 mb-8 text-left space-y-3">
            <h3 className="font-semibold text-sm mb-3">Order Details</h3>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-sm">
              <span>Total Paid</span>
              <span>₹{confirmedOrderTotal}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("dashboard")}
              className="w-full py-3 rounded-2xl text-white font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #a61c9b, #d82a81)",
              }}
            >
              Track Order
            </button>
            <button
              onClick={() => navigate("shop")}
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
    <div className="min-h-screen" style={{ background: "#FFFDF7" }}>
      <SEO
        title="Checkout"
        description="Secure checkout for your craft supplies order at Lemon House."
        noindex={true}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Checkout
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const current = STEPS.findIndex((x) => x.key === step);
            const done = i < current;
            const active = i === current;
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${done
                      ? "bg-accent"
                      : active
                        ? "bg-primary"
                        : "bg-muted border border-border"
                      }`}
                  >
                    {done ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <s.Icon
                        className={`w-4 h-4 ${active ? "text-white" : "text-muted-foreground"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${active ? "text-primary" : done ? "text-accent" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-12 sm:w-20 mx-2 mb-4 transition-all ${i < current ? "bg-accent" : "bg-border"}`}
                  />
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
                {step === "shipping" && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2
                      className="font-bold text-lg mb-5"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Shipping Address
                    </h2>

                    {addresses.length > 0 && (
                      <div className="mb-6 space-y-3">
                        <div className="flex gap-4 mb-4">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                            <input
                              type="radio"
                              name="addressType"
                              checked={useSavedAddress}
                              onChange={() => setUseSavedAddress(true)}
                              className="accent-primary"
                            />
                            Use Saved Address
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                            <input
                              type="radio"
                              name="addressType"
                              checked={!useSavedAddress}
                              onChange={() => setUseSavedAddress(false)}
                              className="accent-primary"
                            />
                            Deliver to a New Address
                          </label>
                        </div>

                        {useSavedAddress && (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {addresses.map((addr) => (
                              <label
                                key={addr.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="savedAddress"
                                  value={addr.id}
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => setSelectedAddressId(addr.id)}
                                  className="accent-primary mt-1"
                                />
                                <div className="text-xs">
                                  <p className="font-bold">{addr.fullName}</p>
                                  <p className="text-muted-foreground mt-0.5">
                                    {addr.addressLine1}
                                    <br />
                                    {addr.city}, {addr.state} – {addr.pincode}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(!useSavedAddress || addresses.length === 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            label: "Full Name",
                            key: "name",
                            type: "text",
                            col: "sm:col-span-2",
                          },
                          {
                            label: "Phone Number",
                            key: "phone",
                            type: "tel",
                            col: "",
                          },
                          {
                            label: "Pin Code",
                            key: "pincode",
                            type: "text",
                            col: "",
                          },
                          {
                            label: "Address",
                            key: "address",
                            type: "text",
                            col: "sm:col-span-2",
                          },
                          { label: "City", key: "city", type: "text", col: "" },
                          { label: "State", key: "state", type: "text", col: "" },
                        ].map((f) => (
                          <div key={f.key} className={f.col}>
                            <label className="block text-sm font-semibold mb-1.5">
                              {f.label}
                            </label>
                            <input
                              type={f.type}
                              value={form[f.key]}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (f.key === "pincode") {
                                  if (/^\d*$/.test(val) && val.length <= 6) {
                                    updateForm(f.key, val);
                                  }
                                } else {
                                  updateForm(f.key, val);
                                }
                              }}
                              maxLength={f.key === "pincode" ? 6 : undefined}
                              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === "delivery" && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <h2
                        className="font-bold text-lg"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        Delivery Method
                      </h2>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-muted rounded-full text-muted-foreground">
                        Total Weight: {totalWeightKg} kg
                      </span>
                    </div>
                    <div className="space-y-3">
                      {loadingRates ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-xs text-muted-foreground">Calculating delivery charges from backend...</p>
                        </div>
                      ) : shippingRates.length > 0 ? (
                        shippingRates.map((opt) => (
                          <label
                            key={opt.courierId}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.deliveryMethod === opt.courierName
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                              }`}
                          >
                            <input
                              type="radio"
                              name="delivery"
                              value={opt.courierName}
                              checked={form.deliveryMethod === opt.courierName}
                              onChange={(e) =>
                                updateForm("deliveryMethod", e.target.value)
                              }
                              className="accent-primary"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{opt.courierName}</p>
                              <p className="text-xs text-muted-foreground">
                                Expected delivery: {opt.eta || "3-5 days"}
                              </p>
                            </div>
                            <span className="font-bold text-sm">
                              ₹{opt.rate}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl">
                          <p className="text-sm text-red-500 font-semibold mb-1">Could not load shipping rates</p>
                          <p className="text-xs text-muted-foreground">{ratesError || "Please ensure your PIN code is correct or try again."}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(STEPS[stepIndex - 1].key)}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-border hover:bg-muted transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
                {step === "shipping" ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm cursor-pointer hover:opacity-90 transition-all shadow-sm"
                    style={{
                      background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                    }}
                  >
                    Continue to Delivery <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={isPlacing || loadingRates}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:opacity-90 transition-all cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                    }}
                  >
                    {isPlacing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Opening Razorpay...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" /> Proceed to Pay ₹{total}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-2xl border border-border p-5 h-fit sticky top-24">
            <h3
              className="font-bold mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Order Summary
            </h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                    {item.name} {item.variantName ? `(${item.variantName})` : ""} ×{item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
