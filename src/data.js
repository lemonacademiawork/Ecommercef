export const CATEGORIES = [
  {
    id: "resin",
    name: "Resin Supplies",
    icon: "🧪",
    count: 124,
    color: "#fbeaf5",
    image:
      "https://images.unsplash.com/photo-1615486511494-cf58e2a7b6c9?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "beads",
    name: "Beads & Stones",
    icon: "💎",
    count: 89,
    color: "#E8F5E9",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "fabric",
    name: "Fabric & Threads",
    icon: "🧵",
    count: 215,
    color: "#FFF9C4",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "embroidery",
    name: "Embroidery",
    icon: "🪡",
    count: 67,
    color: "#fbeaf5",
    image:
      "https://images.unsplash.com/photo-1617721710888-aef4d0fd1e6b?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "art",
    name: "Art Supplies",
    icon: "🎨",
    count: 183,
    color: "#E8F5E9",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "paints",
    name: "Acrylic Paints",
    icon: "🖌️",
    count: 98,
    color: "#FFF9C4",
    image:
      "https://images.unsplash.com/photo-1526743977-0e9e24b98dcc?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "jewelry",
    name: "Jewelry Making",
    icon: "💍",
    count: 144,
    color: "#fbeaf5",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "clay",
    name: "Clay & Pottery",
    icon: "🏺",
    count: 56,
    color: "#E8F5E9",
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "packaging",
    name: "Packaging",
    icon: "📦",
    count: 77,
    color: "#FFF9C4",
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: "kits",
    name: "DIY Kits",
    icon: "🎁",
    count: 42,
    color: "#fbeaf5",
    image:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=300&fit=crop&auto=format",
  },
];

export const PRODUCTS = [
  {
    id: "p1",
    name: "Premium UV Resin Crystal Clear",
    category: "resin",
    price: 649,
    originalPrice: 899,
    rating: 4.8,
    reviews: 234,
    image:
      "https://images.unsplash.com/photo-1615486511494-cf58e2a7b6c9?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1615486511494-cf58e2a7b6c9?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Professional-grade UV resin for jewelry and craft projects. Crystal clear finish with minimal bubbles. Perfect for encapsulating flowers, glitter, and decorative elements.",
    materials: ["UV-curable resin", "BPA-free formula", "100ml bottle"],
    tags: ["resin", "jewelry", "UV", "clear"],
    inStock: true,
    isBestSeller: true,
    discount: 28,
  },
  {
    id: "p2",
    name: "Rainbow Crystal Bead Set (500pcs)",
    category: "beads",
    price: 399,
    originalPrice: 499,
    rating: 4.6,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "A stunning collection of 500 assorted crystal beads in a rainbow of colors. Perfect for bracelets, necklaces, and decorative crafts.",
    materials: ["Crystal glass", "Faceted cut", "Mixed sizes 4–8mm"],
    tags: ["beads", "crystal", "rainbow", "jewelry"],
    inStock: true,
    isBestSeller: true,
    discount: 20,
  },
  {
    id: "p3",
    name: "Hand-dyed Cotton Embroidery Thread Kit",
    category: "embroidery",
    price: 549,
    rating: 4.9,
    reviews: 312,
    image:
      "https://images.unsplash.com/photo-1617721710888-aef4d0fd1e6b?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1617721710888-aef4d0fd1e6b?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "36 vibrant hand-dyed cotton threads for embroidery and cross-stitch. Each skein is individually hand-dyed for unique, rich colors.",
    materials: ["100% cotton", "Hand-dyed", "36 colors", "8m per skein"],
    tags: ["embroidery", "thread", "cotton", "handmade"],
    inStock: true,
    isNew: true,
  },
  {
    id: "p4",
    name: "Professional Acrylic Paint Set 24 Colors",
    category: "paints",
    price: 899,
    originalPrice: 1199,
    rating: 4.7,
    reviews: 421,
    image:
      "https://images.unsplash.com/photo-1526743977-0e9e24b98dcc?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1526743977-0e9e24b98dcc?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Artist-grade acrylic paints with vibrant, lightfast pigments. Smooth consistency, quick-drying, and suitable for canvas, wood, and paper.",
    materials: [
      "Artist-grade pigments",
      "24 colors",
      "75ml tubes",
      "Lightfast",
    ],
    tags: ["paints", "acrylic", "art", "canvas"],
    inStock: true,
    isBestSeller: true,
    discount: 25,
  },
  {
    id: "p5",
    name: "Air-Dry Modeling Clay 1kg White",
    category: "clay",
    price: 299,
    rating: 4.5,
    reviews: 178,
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Premium white air-dry clay that dries without kiln or oven. Perfect for pottery, sculpting, and decorative pieces.",
    materials: [
      "Air-dry polymer",
      "Non-toxic",
      "1kg block",
      "Paintable when dry",
    ],
    tags: ["clay", "pottery", "sculpting", "air-dry"],
    inStock: true,
    isNew: true,
  },
  {
    id: "p6",
    name: "Macramé Cord Set Natural Cotton",
    category: "fabric",
    price: 449,
    originalPrice: 599,
    rating: 4.8,
    reviews: 267,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Natural cotton macramé cord in 3 thicknesses. Ideal for wall hangings, plant hangers, and bohemian home decor.",
    materials: [
      "100% natural cotton",
      "3mm, 5mm, 8mm",
      "Unbleached",
      "100m total",
    ],
    tags: ["macramé", "cotton", "cord", "bohemian"],
    inStock: true,
    discount: 25,
  },
  {
    id: "p7",
    name: "Jewelry Wire Set Gold & Silver",
    category: "jewelry",
    price: 349,
    rating: 4.6,
    reviews: 143,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Tarnish-resistant copper wire plated with 18K gold and sterling silver. Available in 5 gauges for all jewelry-making needs.",
    materials: [
      "Copper core",
      "18K gold plating",
      "Sterling silver plating",
      "Gauges 20–28",
    ],
    tags: ["wire", "jewelry", "gold", "silver"],
    inStock: true,
  },
  {
    id: "p8",
    name: "Watercolor Paper Pad A4 300gsm",
    category: "art",
    price: 599,
    originalPrice: 749,
    rating: 4.7,
    reviews: 356,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Cold-pressed 300gsm cotton watercolor paper that holds wet washes beautifully without buckling. 20 sheets per pad.",
    materials: ["100% cotton", "300gsm cold press", "20 sheets", "A4 size"],
    tags: ["watercolor", "paper", "art", "painting"],
    inStock: true,
    discount: 20,
  },
  {
    id: "p9",
    name: "Complete Resin DIY Starter Kit",
    category: "kits",
    price: 1299,
    originalPrice: 1799,
    rating: 4.9,
    reviews: 512,
    image:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Everything you need to start your resin art journey. Includes UV resin, silicone molds, pigment powders, glitter, tools, and a full instruction guide.",
    materials: [
      "UV resin 100ml",
      "6 silicone molds",
      "12 pigment powders",
      "Glitter set",
      "Mixing tools",
      "UV lamp",
    ],
    tags: ["resin", "kit", "starter", "beginner"],
    inStock: true,
    isBestSeller: true,
    discount: 28,
  },
  {
    id: "p10",
    name: "Kraft Paper Gift Boxes (20pcs)",
    category: "packaging",
    price: 249,
    rating: 4.4,
    reviews: 98,
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Eco-friendly kraft paper gift boxes for packaging handmade products. Multiple sizes available in one set.",
    materials: ["Recycled kraft paper", "300gsm", "20 boxes", "Mixed sizes"],
    tags: ["packaging", "kraft", "gift", "eco"],
    inStock: true,
    isNew: true,
  },
  {
    id: "p11",
    name: "Rose Gold Wire Earring Frames (50pcs)",
    category: "jewelry",
    price: 299,
    originalPrice: 399,
    rating: 4.5,
    reviews: 201,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      "Beautiful rose gold plated earring frames for resin or clay creations. Hypoallergenic hooks included.",
    materials: [
      "Rose gold plated brass",
      "Hypoallergenic",
      "50 pairs",
      "With hooks",
    ],
    tags: ["earrings", "frames", "rose gold", "jewelry"],
    inStock: true,
    discount: 25,
  },
  {
    id: "p12",
    name: "Bamboo Embroidery Hoop Set (6pcs)",
    category: "embroidery",
    price: 399,
    rating: 4.6,
    reviews: 134,
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&auto=format",
    ],
    description:
      'Sustainable bamboo embroidery hoops in 6 sizes from 4" to 12". Smooth finish prevents snagging delicate fabrics.',
    materials: [
      "Natural bamboo",
      '6 sizes: 4"–12"',
      "Adjustable screw",
      "Sustainable",
    ],
    tags: ["embroidery", "hoop", "bamboo", "sustainable"],
    inStock: false,
  },
];

export const REVIEWS = [
  {
    id: "r1",
    author: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format",
    rating: 5,
    comment:
      "Lemon House has completely transformed my craft journey! The UV resin kit is exceptional quality and the packaging is so thoughtful. Fast delivery too!",
    date: "2 days ago",
    product: "UV Resin Crystal Clear",
  },
  {
    id: "r2",
    author: "Meera Patel",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&auto=format",
    rating: 5,
    comment:
      "I've been ordering from Lemon House for 6 months now. The embroidery thread quality is unmatched – the colors are so vibrant and they don't fade. Absolutely love this store!",
    date: "1 week ago",
    product: "Embroidery Thread Kit",
  },
  {
    id: "r3",
    author: "Ananya Krishnan",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&auto=format",
    rating: 4,
    comment:
      "Great selection of beads and great prices. The crystal bead set is perfect for my jewelry business. Will definitely order again!",
    date: "2 weeks ago",
    product: "Rainbow Crystal Bead Set",
  },
  {
    id: "r4",
    author: "Sneha Nair",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format",
    rating: 5,
    comment:
      "The acrylic paint set is professional grade at an affordable price. My art students are obsessed with these paints. The colors blend so beautifully!",
    date: "3 weeks ago",
    product: "Acrylic Paint Set",
  },
];

export const ORDERS = [
  {
    id: "LH-2847",
    date: "Jun 10, 2026",
    status: "Shipped",
    total: 1748,
    items: 3,
    trackingNumber: "DELHIVERY847293",
  },
  {
    id: "LH-2631",
    date: "May 28, 2026",
    status: "Delivered",
    total: 899,
    items: 1,
    trackingNumber: "BLUEDART631847",
  },
  {
    id: "LH-2419",
    date: "May 15, 2026",
    status: "Delivered",
    total: 2147,
    items: 4,
    trackingNumber: "FEDEX419283",
  },
  {
    id: "LH-2103",
    date: "Apr 30, 2026",
    status: "Delivered",
    total: 549,
    items: 1,
    trackingNumber: "DTDC103847",
  },
];
