import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

const CATEGORY_SUBCATEGORIES_MAP = {
  "resin": ["Resin Moulds", "Epoxy Resin", "Pigments & Glitter", "Tools & Mixers"],
  "beads": ["Glass Beads", "Natural Stones", "Pendant Beads", "Stringing Wire"],
  "fabric": ["Threads & Floss", "Embroidery Fabrics", "Ribbons & Lace", "Needles"],
  "embroidery": ["ReadyMade Kits", "DIY Kits", "Hoops & Frames", "Pattern Stencils"],
  "art": ["Canvas & Boards", "Brushes", "Easels", "Drawing Paper"],
  "paints": ["Primary Colors", "Pastel Paints", "Metallic Acrylics", "Pouring Paints"],
  "jewelry": ["Charms & Findings", "Jewelry Pliers", "Beading Wire", "Clasps"],
  "clay": ["Air Dry Clay", "Polymer Clay", "Pottery Tools", "Glazes"],
  "fragrance": ["Vanilla Fragrance Oil", "Floral Fragrance Oil", "Fruity Fragrance Oil", "Essential Oils"],
};

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    shortDescription: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    images: ["", "", "", ""],
    active: true,
    categoryId: "",
    subcategoryId: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    hasVariants: false,
    inlineVariants: [],
  });

  const [newInlineVariant, setNewInlineVariant] = useState({
    variantName: "",
    price: "",
    stock: "",
    sku: "",
  });

  // Variant management states
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [variantsProduct, setVariantsProduct] = useState(null);
  const [variantsList, setVariantsList] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editVariant, setEditVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    variantName: "",
    price: "",
    stock: "",
    sku: "",
    status: "ACTIVE",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.products.listProducts({ all: true }),
        api.categories.listCategories(true),
      ]);
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSubcategoriesForCategory = (catId) => {
    if (!catId) return [];
    const catObj = categories.find((c) => c.id === catId || c.idString === catId);
    
    if (catObj && Array.isArray(catObj.subcategories) && catObj.subcategories.length > 0) {
      return catObj.subcategories;
    }
    
    const catKey = (catObj?.name || catId || "").toLowerCase();
    for (const key in CATEGORY_SUBCATEGORIES_MAP) {
      if (catKey.includes(key)) {
        return CATEGORY_SUBCATEGORIES_MAP[key].map((subName) => ({
          id: subName,
          name: subName,
        }));
      }
    }
    
    return [
      { id: "General / Main", name: "General / Main" },
      { id: "Specialty / Premium", name: "Specialty / Premium" },
      { id: "Tools & Accessories", name: "Tools & Accessories" },
    ];
  };

  const handleCategoryChange = (e) => {
    const selectedCatId = e.target.value;
    setProductForm((prev) => ({
      ...prev,
      categoryId: selectedCatId,
      subcategoryId: "", // Reset subcategory when category changes
    }));
  };

  const handleAddInlineVariant = () => {
    if (!newInlineVariant.variantName || !newInlineVariant.price) {
      toast.error("Variant Name and Price are required!");
      return;
    }

    const varObj = {
      variantName: newInlineVariant.variantName,
      price: Number(newInlineVariant.price),
      stock: Number(newInlineVariant.stock || 0),
      sku: newInlineVariant.sku || `${newInlineVariant.variantName.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: true,
      active: true,
    };

    setProductForm((prev) => ({
      ...prev,
      inlineVariants: [...(prev.inlineVariants || []), varObj],
    }));

    setNewInlineVariant({
      variantName: "",
      price: "",
      stock: "",
      sku: "",
    });
    toast.success(`Added variant "${varObj.variantName}"!`);
  };

  const handleRemoveInlineVariant = async (index, item) => {
    if (item.id && editProduct) {
      try {
        await api.admin.deleteVariant(item.id);
        toast.success("Variant deleted from database");
      } catch (err) {
        console.error("Failed to delete variant:", err);
      }
    }
    setProductForm((prev) => ({
      ...prev,
      inlineVariants: (prev.inlineVariants || []).filter((_, i) => i !== index),
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.categoryId) {
      toast.error("Please select a Category!");
      return;
    }

    try {
      const firstImage = productForm.images.find(img => img !== "") || productForm.imageUrl || "";
      const extraImages = productForm.images.filter(img => img !== "");
      
      let fullDescription = productForm.description;
      if (productForm.shortDescription) {
        fullDescription = `${productForm.shortDescription}\n\n${fullDescription}`;
      }
      if (extraImages.length > 0) {
        fullDescription = `${fullDescription}\n\n[IMAGES:${extraImages.join(",")}]`;
      }

      const firstVar = productForm.inlineVariants && productForm.inlineVariants.length > 0 ? productForm.inlineVariants[0] : null;
      const calcPrice = productForm.price !== "" 
        ? Number(productForm.price) 
        : (firstVar ? Number(firstVar.price) : 0);
      const calcStock = productForm.stock !== "" 
        ? Number(productForm.stock) 
        : (productForm.inlineVariants ? productForm.inlineVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : 0);

      const payload = {
        name: productForm.name,
        brand: productForm.brand,
        shortDescription: productForm.shortDescription,
        description: fullDescription,
        price: calcPrice,
        stock: calcStock,
        imageUrl: firstImage,
        active: productForm.active,
        categoryId: productForm.categoryId,
        subcategoryId: productForm.subcategoryId,
        subcategory: productForm.subcategoryId,
        weight: productForm.weight !== "" ? Number(productForm.weight) : null,
        length: productForm.length !== "" ? Number(productForm.length) : null,
        breadth: productForm.breadth !== "" ? Number(productForm.breadth) : null,
        height: productForm.height !== "" ? Number(productForm.height) : null,
        metaTitle: productForm.metaTitle,
        metaDescription: productForm.metaDescription,
        metaKeywords: productForm.metaKeywords,
        hasVariants: productForm.hasVariants,
      };

      let res;
      if (editProduct) {
        res = await api.products.updateProduct(editProduct.id, payload);
      } else {
        res = await api.products.createProduct(payload);
      }

      if (res.success || res.id || res.data) {
        const productId = editProduct ? editProduct.id : (res.data?.id || res.data?.productId || res.id || res.productId);
        if (productForm.hasVariants && productId && (productForm.inlineVariants || []).length > 0) {
          for (const v of productForm.inlineVariants) {
            if (!v.id) {
              try {
                await api.admin.addVariant(productId, {
                  variantName: v.variantName,
                  price: Number(v.price),
                  stock: Number(v.stock),
                  sku: v.sku,
                  status: true,
                  active: true,
                });
              } catch (err) {
                console.error("Error saving inline variant:", err);
              }
            }
          }
        }

        toast.success(editProduct ? "Product updated successfully!" : "Product & sub-categories saved successfully!");
        setShowProductForm(false);
        setEditProduct(null);
        setProductForm({
          name: "",
          brand: "",
          shortDescription: "",
          description: "",
          price: "",
          stock: "",
          imageUrl: "",
          images: ["", "", "", ""],
          active: true,
          categoryId: "",
          subcategoryId: "",
          weight: "",
          length: "",
          breadth: "",
          height: "",
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          hasVariants: false,
          inlineVariants: [],
        });
        loadData();
      } else {
        toast.error(res.message || "Failed to save product");
      }
    } catch (err) {
      console.error("Failed to save product: " + err.message);
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleEditProductClick = async (product) => {
    setEditProduct(product);
    let existingImages = product.images || [];
    if (!Array.isArray(existingImages)) {
      existingImages = [product.imageUrl || product.image || ""];
    }
    const paddedImages = [...existingImages];
    while (paddedImages.length < 4) {
      paddedImages.push("");
    }
    const imagesToUse = paddedImages.slice(0, 4);

    let loadedInlineVariants = [];
    if (product.hasVariants) {
      try {
        const varRes = await api.admin.getVariants(product.id);
        if (varRes.success && varRes.data) {
          loadedInlineVariants = varRes.data;
        }
      } catch (err) {
        console.error("Error loading variants for edit:", err);
      }
    }

    setProductForm({
      name: product.name,
      brand: product.brand || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      price: product.price,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || product.image || "",
      images: imagesToUse,
      active: product.active !== undefined ? product.active : true,
      categoryId: product.categoryId || "",
      subcategoryId: product.subcategoryId || product.subcategory || "",
      weight: product.weight !== undefined && product.weight !== null ? product.weight : "",
      length: product.length !== undefined && product.length !== null ? product.length : "",
      breadth: product.breadth !== undefined && product.breadth !== null ? product.breadth : "",
      height: product.height !== undefined && product.height !== null ? product.height : "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      metaKeywords: product.metaKeywords || "",
      hasVariants: product.hasVariants || false,
      inlineVariants: loadedInlineVariants,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await api.products.deleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product: " + err.message);
    }
  };

  const loadVariants = async (productId) => {
    try {
      setLoadingVariants(true);
      const res = await api.admin.getVariants(productId);
      if (res.success && res.data) {
        setVariantsList(res.data);
      }
    } catch (err) {
      console.error("Error loading variants:", err);
      toast.error("Failed to load variants");
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleManageVariantsClick = (product) => {
    setVariantsProduct(product);
    setVariantsList([]);
    setShowVariantsModal(true);
    setShowVariantForm(false);
    setEditVariant(null);
    setVariantForm({
      variantName: "",
      price: "",
      stock: "",
      sku: "",
      status: "ACTIVE",
    });
    loadVariants(product.id);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      const isStatusActive = variantForm.status === "ACTIVE" || variantForm.status === true || variantForm.status === "true";
      const payload = {
        variantName: variantForm.variantName,
        price: Number(variantForm.price),
        stock: Number(variantForm.stock),
        sku: variantForm.sku,
        status: isStatusActive,
        active: isStatusActive,
      };

      let res;
      if (editVariant) {
        res = await api.admin.updateVariant(editVariant.id, payload);
      } else {
        res = await api.admin.addVariant(variantsProduct.id, payload);
      }

      if (res.success) {
        toast.success(editVariant ? "Variant updated successfully!" : "Variant added successfully!");
        setShowVariantForm(false);
        setEditVariant(null);
        setVariantForm({
          variantName: "",
          price: "",
          stock: "",
          sku: "",
          status: "ACTIVE",
        });
        loadVariants(variantsProduct.id);
      } else {
        toast.error(res.message || "Failed to save variant");
      }
    } catch (err) {
      console.error("Error saving variant:", err);
      toast.error(err.message || "Failed to save variant");
    }
  };

  const handleEditVariantClick = (variant) => {
    setEditVariant(variant);
    setVariantForm({
      variantName: variant.variantName,
      price: variant.price,
      stock: variant.stock || 0,
      sku: variant.sku || "",
      status: variant.status || "ACTIVE",
    });
    setShowVariantForm(true);
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;
    try {
      const res = await api.admin.deleteVariant(variantId);
      if (res.success) {
        toast.success("Variant deleted successfully");
        loadVariants(variantsProduct.id);
      }
    } catch (err) {
      console.error("Error deleting variant:", err);
      toast.error("Failed to delete variant");
    }
  };

  const handleSlotImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.admin.uploadImage(file);
      if (res.success && res.data) {
        setProductForm((prev) => {
          const updatedImages = [...prev.images];
          updatedImages[index] = res.data.imageUrl;
          return {
            ...prev,
            images: updatedImages,
          };
        });
        toast.success(`Slot ${index + 1} image uploaded successfully!`);
      }
    } catch (err) {
      console.error("Image upload failed: " + err.message);
      toast.error("Failed to upload image");
    }
  };

  const removeSlotImage = (index) => {
    setProductForm((prev) => {
      const updatedImages = [...prev.images];
      updatedImages[index] = "";
      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading products catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Products Catalog
        </h1>
        <button
          onClick={() => {
            setEditProduct(null);
            setProductForm({
              name: "",
              description: "",
              price: "",
              stock: "",
              imageUrl: "",
              images: ["", "", "", ""],
              active: true,
              categoryId: categories[0]?.id || "",
              weight: "",
              length: "",
              breadth: "",
              height: "",
              hasVariants: false,
              inlineVariants: [],
            });
            setNewInlineVariant({
              variantName: "",
              price: "",
              stock: "",
              sku: "",
            });
            setShowProductForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #a61c9b, #d82a81)",
          }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {editProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-muted-foreground">Configure product details, category hierarchy & variants</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProductForm(false);
                  setEditProduct(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              {/* Category Selection Row */}
              <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-purple-950">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={productForm.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm bg-white focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vanilla Premium Fragrance Oil"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Lemon Craft"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  placeholder="Detailed product description..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm h-24 resize-none"
                />
              </div>

              {/* Pricing & Stock (Only for simple products without variants) */}
              {!productForm.hasVariants && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 299"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Physical Dimensions & Weight */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Weight (g)</label>
                  <input
                    type="number"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Length (cm)</label>
                  <input
                    type="number"
                    value={productForm.length}
                    onChange={(e) => setProductForm({ ...productForm, length: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Width (cm)</label>
                  <input
                    type="number"
                    value={productForm.breadth}
                    onChange={(e) => setProductForm({ ...productForm, breadth: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={productForm.height}
                    onChange={(e) => setProductForm({ ...productForm, height: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
              </div>

              {/* Collapsible SEO Metadata */}
              <details className="border border-border rounded-2xl p-3 bg-muted/10 group">
                <summary className="text-xs font-bold text-muted-foreground uppercase cursor-pointer tracking-wider flex items-center justify-between">
                  <span>🔍 SEO Metadata (Optional)</span>
                  <span className="text-[10px] font-normal text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="space-y-2.5 mt-3 pt-2 border-t border-border">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Meta Title</label>
                    <input
                      type="text"
                      placeholder="SEO Page Title"
                      value={productForm.metaTitle}
                      onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Meta Description</label>
                    <textarea
                      placeholder="SEO Search snippet description..."
                      value={productForm.metaDescription}
                      onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs h-14 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      placeholder="e.g. fragrance oil, vanilla, craft supplies"
                      value={productForm.metaKeywords}
                      onChange={(e) => setProductForm({ ...productForm, metaKeywords: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs"
                    />
                  </div>
                </div>
              </details>

              {/* Images Upload */}
              <div>
                <label className="block text-xs font-semibold mb-2">Product Images (4 Sides)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: "Front (Main)", index: 0 },
                    { label: "Back View", index: 1 },
                    { label: "Side View", index: 2 },
                    { label: "Top/Detail", index: 3 },
                  ].map(({ label, index }) => {
                    const imgUrl = productForm.images[index];
                    return (
                      <div key={index} className="border border-border rounded-xl p-2 bg-muted/20 relative flex flex-col justify-between min-h-[130px]">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>
                        {imgUrl ? (
                          <div className="relative group rounded-lg overflow-hidden flex-1 bg-black/5 min-h-[70px]">
                            <img
                              src={imgUrl}
                              alt={label}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeSlotImage(index)}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-10 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-1.5 transition-colors cursor-pointer bg-white relative min-h-[70px]">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSlotImageUpload(e, index)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Upload className="w-4 h-4 text-muted-foreground mb-0.5" />
                            <span className="text-[9px] text-muted-foreground font-semibold">Upload</span>
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Or paste URL..."
                          value={imgUrl || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductForm((prev) => {
                              const updatedImages = [...prev.images];
                              updatedImages[index] = val;
                              return {
                                ...prev,
                                images: updatedImages,
                              };
                            });
                          }}
                          className="w-full mt-1 px-1.5 py-0.5 rounded-lg border border-border text-[9px] bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={productForm.active}
                    onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                  />
                  <label htmlFor="active" className="text-xs font-semibold cursor-pointer">Active (Visible in Shop)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasVariants"
                    checked={productForm.hasVariants}
                    onChange={(e) => setProductForm({ ...productForm, hasVariants: e.target.checked })}
                  />
                  <label htmlFor="hasVariants" className="text-xs font-semibold cursor-pointer">Variable Product (has Variants)</label>
                </div>
              </div>

              {productForm.hasVariants && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                      Variants Details
                    </h4>
                    <span className="text-[11px] text-purple-700 font-semibold">
                      ({(productForm.inlineVariants || []).length} Added)
                    </span>
                  </div>

                  {/* Add Variant Input Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Variant Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 500g, 1kg, Small"
                        value={newInlineVariant.variantName}
                        onChange={(e) => setNewInlineVariant({ ...newInlineVariant, variantName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 499"
                        value={newInlineVariant.price}
                        onChange={(e) => setNewInlineVariant({ ...newInlineVariant, price: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={newInlineVariant.stock}
                        onChange={(e) => setNewInlineVariant({ ...newInlineVariant, stock: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddInlineVariant}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-colors shadow cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Variant
                      </button>
                    </div>
                  </div>

                  {/* List of Added Inline Variants */}
                  {(productForm.inlineVariants || []).length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(productForm.inlineVariants || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-purple-100 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-purple-950">{item.variantName}</span>
                            <span className="text-purple-700 font-semibold">₹{item.price}</span>
                            <span className="text-muted-foreground text-[11px]">Stock: {item.stock}</span>
                            {item.sku && <span className="font-mono text-[10px] text-gray-400">SKU: {item.sku}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveInlineVariant(idx, item)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Remove Variant"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-purple-700 italic text-center py-1">
                      No variants added yet. Fill the inputs above and click "+ Add Variant".
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f8f9fc" }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Price
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Stock
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover bg-muted flex-shrink-0"
                      />
                      <span className="font-medium line-clamp-1 max-w-xs">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground capitalize">
                        {categories.find((c) => c.id === product.categoryId)?.name || product.category || "—"}
                      </span>
                      {(product.subcategory || product.subcategoryId) && (
                        <span className="text-[11px] text-purple-700 font-medium">
                          › {product.subcategory || product.subcategoryId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ₹{product.price}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {product.stock || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {product.hasVariants && (
                        <button
                          onClick={() => handleManageVariantsClick(product)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted font-bold transition-colors cursor-pointer text-primary"
                        >
                          Variants
                        </button>
                      )}
                      <button
                        onClick={() => handleEditProductClick(product)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Variants Modal */}
      {showVariantsModal && variantsProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Manage Variants
                </h2>
                <p className="text-xs text-muted-foreground">Configuring variants for: <strong>{variantsProduct.name}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowVariantsModal(false);
                  setVariantsProduct(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showVariantForm ? (
              <form onSubmit={handleVariantSubmit} className="space-y-4 bg-muted/20 p-4 rounded-2xl mb-6 border border-border">
                <h3 className="text-sm font-bold text-foreground">{editVariant ? "Edit Variant" : "Add Variant"}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Variant Name (e.g. 500g, 1kg)</label>
                    <input
                      type="text"
                      required
                      value={variantForm.variantName}
                      onChange={(e) => setVariantForm({ ...variantForm, variantName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">SKU</label>
                    <input
                      type="text"
                      required
                      value={variantForm.sku}
                      onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={variantForm.price}
                      onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Stock</label>
                    <input
                      type="number"
                      required
                      value={variantForm.stock}
                      onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Status</label>
                    <select
                      value={variantForm.status}
                      onChange={(e) => setVariantForm({ ...variantForm, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVariantForm(false);
                      setEditVariant(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-white font-semibold text-xs cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
                  >
                    Save Variant
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditVariant(null);
                    setVariantForm({
                      variantName: "",
                      price: "",
                      stock: "",
                      sku: "",
                      status: "ACTIVE",
                    });
                    setShowVariantForm(true);
                  }}
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs mb-4 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
                >
                  + Add Variant
                </button>
              </div>
            )}

            {loadingVariants ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : variantsList.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">No variants configured for this product yet.</p>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden bg-card text-xs">
                <table className="w-full text-left">
                  <thead style={{ background: "#f8f9fc" }}>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px]">Variant Name</th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px]">Price</th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px]">Stock</th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px]">SKU</th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px]">Status</th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground uppercase text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {variantsList.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-foreground">{v.variantName}</td>
                        <td className="px-4 py-2.5 font-bold text-foreground">₹{v.price}</td>
                        <td className="px-4 py-2.5 text-foreground">{v.stock}</td>
                        <td className="px-4 py-2.5 font-mono text-foreground">{v.sku}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditVariantClick(v)}
                              className="text-primary hover:underline font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(v.id)}
                              className="text-destructive hover:underline font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
