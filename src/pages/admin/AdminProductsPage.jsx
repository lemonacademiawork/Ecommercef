import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  Plus, Edit2, Trash2, X, Upload, Loader2, ChevronUp, ChevronDown,
  ChevronsUpDown, Filter, AlertTriangle, Package,
} from "lucide-react";
import { api, clearApiCache, mapProductData } from "../../services/api";
import { toast } from "sonner";
import { AdminPagination } from "../../components/AdminPagination";
import SearchInput from "../../components/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

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

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-3 w-10 rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-5 w-14 rounded-full bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-muted" /></td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted" />
          <div className="w-7 h-7 rounded-lg bg-muted" />
        </div>
      </td>
    </tr>
  );
}

// ─── Sort Header Cell ──────────────────────────────────────────────────────────
function SortHeader({ label, field, sortBy, sortDir, onSort }) {
  const isActive = sortBy === field;
  return (
    <th
      className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer select-none group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={`transition-colors ${isActive ? "text-primary" : "text-border group-hover:text-muted-foreground"}`}>
          {isActive ? (
            sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronsUpDown className="w-3.5 h-3.5" />
          )}
        </span>
      </div>
    </th>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({ product, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ fontFamily: "Poppins, sans-serif" }}>
              Delete Product?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{product?.name}"</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted disabled:opacity-60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-synced state ──────────────────────────────────────────────────────
  const page = Number(searchParams.get("page") || 0);
  const size = Number(searchParams.get("size") || 10);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";
  const searchParam = searchParams.get("search") || "";
  const categoryIdParam = searchParams.get("categoryId") || "";
  const stockFilterParam = searchParams.get("stockFilter") || "";

  // ── Local state ───────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search: local input → debounced → URL param
  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 350);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [uploadingSlotIndex, setUploadingSlotIndex] = useState(null);

  const defaultProductForm = {
    name: "", brand: "", description: "",
    price: "", stock: "", imageUrl: "", images: ["", "", "", ""], imageFiles: [],
    active: true, categoryId: "", subcategoryId: "",
    weight: "", length: "", breadth: "", height: "",
    metaTitle: "", metaDescription: "", metaKeywords: "",
    hasVariants: false, inlineVariants: [],
  };
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [newInlineVariant, setNewInlineVariant] = useState({ variantName: "", price: "", stock: "", sku: "" });

  // Variant modal
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [variantsProduct, setVariantsProduct] = useState(null);
  const [variantsList, setVariantsList] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editVariant, setEditVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({ variantName: "", price: "", stock: "", sku: "", status: "ACTIVE" });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setParam = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        page, size, sortBy, sortDir,
        search: searchParam,
        categoryId: categoryIdParam,
        stockFilter: stockFilterParam,
        ...overrides,
      };
      const res = await api.admin.listProducts(params);
      if (res.success) {
        const pag = res.pagination;
        if (pag && Array.isArray(pag.content)) {
          setProducts(pag.content.map(mapProductData));
          setTotalElements(pag.totalElements);
          setTotalPages(pag.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          let list = res.data.map(mapProductData);
          if (stockFilterParam === "OUT_OF_STOCK") {
            list = list.filter((p) => Number(p.stock) <= 0);
          } else if (stockFilterParam === "LOW_STOCK") {
            list = list.filter((p) => Number(p.stock) > 0 && Number(p.stock) < 5);
          } else if (stockFilterParam === "IN_STOCK") {
            list = list.filter((p) => Number(p.stock) > 0);
          }
          setProducts(list);
          setTotalElements(list.length);
          setTotalPages(1);
        } else {
          setProducts([]);
        }
      } else {
        toast.error(res.message || "Failed to load products");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir, searchParam, categoryIdParam, stockFilterParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load categories once
  useEffect(() => {
    api.categories.listCategories(true)
      .then((res) => { if (res.success && res.data) setCategories(res.data); })
      .catch(() => {});
  }, []);

  // Sync debouncedSearch → URL params (resets page to 0)
  useEffect(() => {
    setParam({ search: debouncedSearch || undefined, page: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleCategoryFilter = (e) => {
    setParam({ categoryId: e.target.value, page: 0 });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setParam({ sortDir: sortDir === "asc" ? "desc" : "asc", page: 0 });
    } else {
      setParam({ sortBy: field, sortDir: "asc", page: 0 });
    }
  };

  const handlePageChange = (newPage) => setParam({ page: newPage });
  const handlePageSizeChange = (newSize) => setParam({ size: newSize, page: 0 });

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.admin.deleteProduct(deleteTarget.id);
      if (res.success !== false) {
        toast.success(`"${deleteTarget.name}" deleted successfully`);
        setDeleteTarget(null);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to delete product");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };
  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditProductClick = async (product) => {
    setEditProduct(product);
    let existingImages = Array.isArray(product.images) ? product.images : [product.imageUrl || ""];
    const paddedImages = [...existingImages];
    while (paddedImages.length < 4) paddedImages.push("");

    let loadedInlineVariants = [];
    if (product.hasVariants) {
      try {
        const varRes = await api.admin.getVariants(product.id);
        if (varRes.success && varRes.data) loadedInlineVariants = varRes.data;
      } catch {}
    }

    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      description: product.description || "",
      price: product.price,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || product.image || "",
      images: paddedImages.slice(0, 4),
      imageFiles: [],
      active: product.active !== undefined ? product.active : true,
      categoryId: product.categoryId || "",
      subcategoryId: product.subcategoryId || product.subcategory || "",
      weight: product.weight ?? "",
      length: product.length ?? "",
      breadth: product.breadth ?? "",
      height: product.height ?? "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      metaKeywords: product.metaKeywords || "",
      hasVariants: product.hasVariants || false,
      inlineVariants: loadedInlineVariants,
    });
    setShowProductForm(true);
  };

  // ── Product Submit ────────────────────────────────────────────────────────
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (submittingProduct) return;

    if (!productForm.name?.trim()) { toast.error("Please enter a Product Name!"); return; }

    const catId = String(productForm.categoryId || "").trim();
    if (!catId) { toast.error("Please select a valid Category!"); return; }

    // Shipping Dimensions validation (mandatory)
    if (productForm.weight === "" || productForm.weight === null || productForm.weight === undefined) {
      toast.error("Please enter Weight (g) for shipping dimensions!"); return;
    }
    if (productForm.length === "" || productForm.length === null || productForm.length === undefined) {
      toast.error("Please enter Length (cm) for shipping dimensions!"); return;
    }
    if (productForm.breadth === "" || productForm.breadth === null || productForm.breadth === undefined) {
      toast.error("Please enter Width/Breadth (cm) for shipping dimensions!"); return;
    }
    if (productForm.height === "" || productForm.height === null || productForm.height === undefined) {
      toast.error("Please enter Height (cm) for shipping dimensions!"); return;
    }

    setSubmittingProduct(true);
    try {
      const firstImage = productForm.images.find((img) => img !== "") || productForm.imageUrl || "";
      const extraImages = productForm.images.filter((img) => img !== "");

      let fullDescription = productForm.description || "";
      if (extraImages.length > 0) {
        fullDescription = `${fullDescription}\n\n[IMAGES:${extraImages.join(",")}]`;
      }

      const firstVar = productForm.inlineVariants?.length > 0 ? productForm.inlineVariants[0] : null;
      const rawPrice = productForm.price !== "" ? Number(productForm.price) : (firstVar ? Number(firstVar.price) : 0);
      const rawStock = productForm.stock !== ""
        ? Number(productForm.stock)
        : (productForm.inlineVariants?.reduce((s, v) => s + (Number(v.stock) || 0), 0) || 0);

      const calcPrice = isNaN(rawPrice) || rawPrice < 0 ? 0 : rawPrice;
      const calcStock = isNaN(rawStock) || rawStock < 0 ? 0 : rawStock;

      // Build FormData according to Spring Boot backend contract
      const formData = new FormData();
      formData.append("name", productForm.name.trim());
      formData.append("categoryId", catId);
      formData.append("category", catId);
      formData.append("price", String(calcPrice));
      formData.append("stock", String(Math.floor(calcStock)));
      formData.append("description", fullDescription);
      formData.append("brand", productForm.brand || "");
      formData.append("active", productForm.active ? "true" : "false");
      formData.append("imageUrl", firstImage);
      formData.append("image", firstImage);

      // Append raw File objects if available
      if (productForm.imageFiles && Array.isArray(productForm.imageFiles)) {
        productForm.imageFiles.forEach((file) => {
          if (file && file instanceof File) {
            formData.append("images", file);
            formData.append("imageFiles", file);
          }
        });
      }

      if (productForm.subcategoryId) {
        formData.append("subcategoryId", productForm.subcategoryId);
        formData.append("subcategory", productForm.subcategoryId);
      }
      if (productForm.weight !== "") formData.append("weight", String(productForm.weight));
      if (productForm.length !== "") formData.append("length", String(productForm.length));
      if (productForm.breadth !== "") {
        formData.append("breadth", String(productForm.breadth));
        formData.append("width", String(productForm.breadth));
      }
      if (productForm.height !== "") formData.append("height", String(productForm.height));
      formData.append("metaTitle", productForm.metaTitle || "");
      formData.append("metaDescription", productForm.metaDescription || "");
      formData.append("metaKeywords", productForm.metaKeywords || "");
      formData.append("hasVariants", productForm.hasVariants ? "true" : "false");

      // Build JSON fallback payload with alias properties for Spring Boot Jackson DTO binding
      const jsonPayload = {
        name: productForm.name.trim(),
        categoryId: catId,
        category: catId,
        price: calcPrice,
        stock: Math.floor(calcStock),
        description: fullDescription,
        brand: productForm.brand || "",
        active: Boolean(productForm.active),
        imageUrl: firstImage,
        image: firstImage,
        images: extraImages,
        subcategoryId: productForm.subcategoryId || null,
        weight: productForm.weight !== "" ? Number(productForm.weight) : null,
        length: productForm.length !== "" ? Number(productForm.length) : null,
        breadth: productForm.breadth !== "" ? Number(productForm.breadth) : null,
        width: productForm.breadth !== "" ? Number(productForm.breadth) : null,
        height: productForm.height !== "" ? Number(productForm.height) : null,
        metaTitle: productForm.metaTitle || "",
        metaDescription: productForm.metaDescription || "",
        metaKeywords: productForm.metaKeywords || "",
        hasVariants: Boolean(productForm.hasVariants),
      };

      let res;
      if (editProduct) {
        res = await api.admin.updateProduct(editProduct.id, formData, jsonPayload);
      } else {
        res = await api.admin.createProduct(formData, jsonPayload);
      }

      if (res.success !== false) {
        const savedId = editProduct ? editProduct.id : (res.data?.id || res.data?.productId || res.id);
        // Save new inline variants
        if (productForm.hasVariants && savedId && productForm.inlineVariants?.length > 0) {
          for (const v of productForm.inlineVariants) {
            if (!v.id) {
              try {
                await api.admin.addVariant(savedId, {
                  variantName: v.variantName, price: Number(v.price),
                  stock: Number(v.stock), sku: v.sku, status: true, active: true,
                });
              } catch {}
            }
          }
        }
        toast.success(editProduct ? "Product updated successfully!" : "Product created successfully!");
        setShowProductForm(false);
        setEditProduct(null);
        setProductForm(defaultProductForm);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to save product");
      }
    } catch (err) {
      const errorDetails = err.response?.data || err.data || err.message;
      console.error("Server 400 Validation Failure Details:", errorDetails);
      const displayMsg = typeof errorDetails === "object"
        ? (errorDetails?.message || errorDetails?.data || JSON.stringify(errorDetails))
        : String(errorDetails);
      toast.error(`Validation Failure: ${displayMsg}`);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // ── Inline Variant Helpers ────────────────────────────────────────────────
  const handleAddInlineVariant = () => {
    if (!newInlineVariant.variantName || !newInlineVariant.price) {
      toast.error("Variant Name and Price are required!");
      return;
    }
    const varObj = {
      variantName: newInlineVariant.variantName,
      price: Number(newInlineVariant.price),
      stock: Number(newInlineVariant.stock || 0),
      sku: newInlineVariant.sku || `${newInlineVariant.variantName.replace(/\s+/g, "-").toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: true, active: true,
    };
    setProductForm((prev) => ({ ...prev, inlineVariants: [...(prev.inlineVariants || []), varObj] }));
    setNewInlineVariant({ variantName: "", price: "", stock: "", sku: "" });
    toast.success(`Added variant "${varObj.variantName}"!`);
  };

  const handleRemoveInlineVariant = async (index, item) => {
    if (item.id && editProduct) {
      try { await api.admin.deleteVariant(item.id); } catch {}
    }
    setProductForm((prev) => ({ ...prev, inlineVariants: (prev.inlineVariants || []).filter((_, i) => i !== index) }));
  };

  // ── Variant Modal Handlers ────────────────────────────────────────────────
  const loadVariants = async (productId) => {
    setLoadingVariants(true);
    try {
      const res = await api.admin.getVariants(productId);
      if (res.success && res.data) setVariantsList(res.data);
    } catch (err) {
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
    setVariantForm({ variantName: "", price: "", stock: "", sku: "", status: "ACTIVE" });
    loadVariants(product.id);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      const isActive = variantForm.status === "ACTIVE" || variantForm.status === true;
      const payload = {
        variantName: variantForm.variantName, price: Number(variantForm.price),
        stock: Number(variantForm.stock), sku: variantForm.sku, status: isActive, active: isActive,
      };
      const res = editVariant
        ? await api.admin.updateVariant(editVariant.id, payload)
        : await api.admin.addVariant(variantsProduct.id, payload);
      if (res.success) {
        toast.success(editVariant ? "Variant updated!" : "Variant added!");
        setShowVariantForm(false);
        setEditVariant(null);
        setVariantForm({ variantName: "", price: "", stock: "", sku: "", status: "ACTIVE" });
        loadVariants(variantsProduct.id);
      } else {
        toast.error(res.message || "Failed to save variant");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save variant");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      const res = await api.admin.deleteVariant(variantId);
      if (res.success) { toast.success("Variant deleted"); loadVariants(variantsProduct.id); }
    } catch (err) {
      toast.error("Failed to delete variant");
    }
  };

  // ── Image Upload ──────────────────────────────────────────────────────────
  const handleSlotImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSlotIndex(index);

    // Track raw File object
    setProductForm((prev) => {
      const updatedFiles = [...(prev.imageFiles || [])];
      updatedFiles[index] = file;
      return { ...prev, imageFiles: updatedFiles };
    });

    try {
      const res = await api.admin.uploadImage(file);
      if (res.success && res.data) {
        setProductForm((prev) => {
          const updated = [...prev.images];
          updated[index] = res.data.imageUrl;
          return { ...prev, images: updated };
        });
        toast.success(`Image ${index + 1} uploaded!`);
      }
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploadingSlotIndex(null);
    }
  };

  const removeSlotImage = (index) => {
    setProductForm((prev) => {
      const updated = [...prev.images];
      updated[index] = "";
      return { ...prev, images: updated };
    });
  };

  const getSubcategoriesForCategory = (catId) => {
    if (!catId) return [];
    const catObj = categories.find((c) => c.id === catId || c.idString === catId);
    if (catObj && Array.isArray(catObj.subcategories) && catObj.subcategories.length > 0) return catObj.subcategories;
    const catKey = (catObj?.name || catId || "").toLowerCase();
    for (const key in CATEGORY_SUBCATEGORIES_MAP) {
      if (catKey.includes(key)) {
        return CATEGORY_SUBCATEGORIES_MAP[key].map((n) => ({ id: n, name: n }));
      }
    }
    return [
      { id: "General / Main", name: "General / Main" },
      { id: "Specialty / Premium", name: "Specialty / Premium" },
      { id: "Tools & Accessories", name: "Tools & Accessories" },
    ];
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
          Products Catalog
        </h1>
        <button
          onClick={() => { setEditProduct(null); setProductForm(defaultProductForm); setNewInlineVariant({ variantName: "", price: "", stock: "", sku: "" }); setShowProductForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => setSearchInput("")}
          isLoading={loading && !!debouncedSearch}
          placeholder="Search products by name or description…"
          className="flex-1"
        />
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={categoryIdParam}
            onChange={handleCategoryFilter}
            className="pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={stockFilterParam}
            onChange={(e) => setParam({ stockFilter: e.target.value || undefined, page: 0 })}
            className="pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
          >
            <option value="">All Stock Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock (&lt; 5)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f8f9fc" }}>
              <tr>
                <SortHeader label="Product" field="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Category</th>
                <SortHeader label="Price" field="price" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Stock" field="stock" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Status</th>
                <SortHeader label="Created" field="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: size > 10 ? 10 : size }).map((_, i) => <SkeletonRow key={i} />)
                : products.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No products found</p>
                      {searchParam
                        ? <p className="text-xs text-muted-foreground/60 mt-1">No results found matching "{searchParam}"</p>
                        : stockFilterParam
                        ? <p className="text-xs text-muted-foreground/60 mt-1">No products match stock status: {stockFilterParam.replace("_", " ")}</p>
                        : categoryIdParam && <p className="text-xs text-muted-foreground/60 mt-1">Try selecting a different category</p>
                      }
                    </td>
                  </tr>
                )
                : products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getOptimizedImageUrl(product.image || product.imageUrl || "https://via.placeholder.com/40", { width: 100 })}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0 border border-border"
                        />
                        <span className="font-medium line-clamp-2 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{product.categoryName || product.category || "—"}</td>
                    <td className="px-4 py-3 font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${product.stock === 0 ? "text-destructive" : product.stock < 10 ? "text-amber-600" : ""}`}>
                        {product.stock ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${product.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {product.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProductClick(product)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {product.hasVariants && (
                          <button
                            onClick={() => handleManageVariantsClick(product)}
                            title="Manage Variants"
                            className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors text-muted-foreground hover:text-purple-700 cursor-pointer text-[10px] font-bold border border-transparent hover:border-purple-200"
                          >
                            VAR
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(product)}
                          title="Delete"
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

        {/* ── Pagination ── */}
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      {deleteTarget && (
        <DeleteConfirmDialog
          product={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* ── Product Create/Edit Modal ── */}
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
                onClick={() => { setShowProductForm(false); setEditProduct(null); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              {/* Category */}
              <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                <label className="block text-xs font-semibold mb-1 text-purple-950">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm((p) => ({ ...p, categoryId: e.target.value, subcategoryId: "" }))}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm bg-white focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text" required
                    placeholder="e.g. Vanilla Premium Fragrance Oil"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Brand</label>
                  <input
                    type="text" placeholder="e.g. Lemon Craft"
                    value={productForm.brand}
                    onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1">Full Description</label>
                <textarea
                  rows={4} placeholder="Detailed product description"
                  value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-y"
                />
              </div>

              {/* Price, Stock, Active */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Stock</label>
                  <input
                    type="number" min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div className="flex flex-col justify-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.active}
                      onChange={(e) => setProductForm((p) => ({ ...p, active: e.target.checked }))}
                    />
                    <span className="text-xs font-semibold">Active</span>
                  </label>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-semibold mb-2">Product Images (up to 4)</label>
                <div className="grid grid-cols-4 gap-2">
                  {productForm.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden group"
                    >
                      {img ? (
                        <>
                          <img src={getOptimizedImageUrl(img, { width: 200 })} alt={`slot-${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSlotImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center gap-1 cursor-pointer w-full h-full justify-center">
                          {uploadingSlotIndex === idx
                            ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            : <Upload className="w-4 h-4 text-muted-foreground" />
                          }
                          <span className="text-[10px] text-muted-foreground">{idx === 0 ? "Main" : `Img ${idx + 1}`}</span>
                          <input
                            type="file" accept="image/*" className="hidden"
                            onChange={(e) => handleSlotImageUpload(e, idx)}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Has Variants Toggle */}
              <div className="flex items-center gap-2 py-1 border-t border-border pt-4">
                <input
                  type="checkbox" id="hasVariants"
                  checked={productForm.hasVariants}
                  onChange={(e) => setProductForm((p) => ({ ...p, hasVariants: e.target.checked }))}
                />
                <label htmlFor="hasVariants" className="text-xs font-semibold cursor-pointer">
                  This product has variants (sizes, colours, etc.)
                </label>
              </div>

              {/* Inline Variants */}
              {productForm.hasVariants && (
                <div className="bg-purple-50/40 rounded-2xl p-3.5 border border-purple-100 space-y-3">
                  <p className="text-xs font-semibold text-purple-900">Variants</p>
                  {(productForm.inlineVariants || []).map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-border text-xs">
                      <span className="font-semibold flex-1">{v.variantName}</span>
                      <span>₹{v.price}</span>
                      <span className="text-muted-foreground">Qty: {v.stock}</span>
                      <button type="button" onClick={() => handleRemoveInlineVariant(idx, v)}
                        className="p-1 text-destructive hover:bg-red-50 rounded-lg cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: "variantName", placeholder: "Name *", type: "text" },
                      { key: "price", placeholder: "Price *", type: "number" },
                      { key: "stock", placeholder: "Stock", type: "number" },
                      { key: "sku", placeholder: "SKU", type: "text" },
                    ].map(({ key, placeholder, type }) => (
                      <input
                        key={key} type={type} placeholder={placeholder}
                        value={newInlineVariant[key]}
                        onChange={(e) => setNewInlineVariant((p) => ({ ...p, [key]: e.target.value }))}
                        className="px-2.5 py-2 rounded-xl border border-border text-xs"
                      />
                    ))}
                  </div>
                  <button type="button" onClick={handleAddInlineVariant}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>
              )}

              {/* Shipping Dimensions (Mandatory) */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-2">
                <p className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  Shipping Dimensions <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { field: "weight", label: "Weight (g)" },
                    { field: "length", label: "Length (cm)" },
                    { field: "breadth", label: "Width/Breadth (cm)" },
                    { field: "height", label: "Height (cm)" },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold mb-1 text-foreground">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number" min="0" step="0.01" required
                        placeholder="0"
                        value={productForm[field]}
                        onChange={(e) => setProductForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <details className="border border-border rounded-2xl">
                <summary className="px-4 py-2.5 text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                  SEO / Meta Fields (optional)
                </summary>
                <div className="space-y-3 p-4 pt-2">
                  {[
                    { field: "metaTitle", label: "Meta Title" },
                    { field: "metaDescription", label: "Meta Description" },
                    { field: "metaKeywords", label: "Meta Keywords" },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold mb-1">{label}</label>
                      <input
                        type="text"
                        value={productForm[field]}
                        onChange={(e) => setProductForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                      />
                    </div>
                  ))}
                </div>
              </details>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowProductForm(false); setEditProduct(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submittingProduct}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
                >
                  {submittingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Variants Modal ── */}
      {showVariantsModal && variantsProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Manage Variants
                </h2>
                <p className="text-xs text-muted-foreground">{variantsProduct.name}</p>
              </div>
              <button onClick={() => setShowVariantsModal(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingVariants
              ? <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              : (
                <div className="space-y-2 mb-4">
                  {variantsList.length === 0
                    ? <p className="text-sm text-muted-foreground text-center py-4">No variants yet. Add one below.</p>
                    : variantsList.map((v) => (
                      <div key={v.id} className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2 text-sm">
                        <span className="font-semibold flex-1">{v.variantName}</span>
                        <span>₹{v.price}</span>
                        <span className="text-muted-foreground text-xs">Qty: {v.stock}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${v.status || v.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {v.status || v.active ? "Active" : "Inactive"}
                        </span>
                        <button onClick={() => { setEditVariant(v); setVariantForm({ variantName: v.variantName, price: v.price, stock: v.stock || 0, sku: v.sku || "", status: v.status ? "ACTIVE" : "INACTIVE" }); setShowVariantForm(true); }}
                          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteVariant(v.id)}
                          className="p-1 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  }
                </div>
              )
            }

            <button
              type="button"
              onClick={() => { setEditVariant(null); setVariantForm({ variantName: "", price: "", stock: "", sku: "", status: "ACTIVE" }); setShowVariantForm(true); }}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 mb-4 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Variant
            </button>

            {showVariantForm && (
              <form onSubmit={handleVariantSubmit} className="space-y-3 border-t border-border pt-4">
                <p className="text-xs font-semibold">{editVariant ? "Edit Variant" : "New Variant"}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: "variantName", label: "Variant Name *", type: "text", required: true },
                    { field: "price", label: "Price *", type: "number", required: true },
                    { field: "stock", label: "Stock", type: "number" },
                    { field: "sku", label: "SKU", type: "text" },
                  ].map(({ field, label, type, required }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold mb-1">{label}</label>
                      <input
                        type={type} required={required}
                        value={variantForm[field]}
                        onChange={(e) => setVariantForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={variantForm.status}
                    onChange={(e) => setVariantForm((p) => ({ ...p, status: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-border text-sm bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowVariantForm(false)}
                    className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}>
                    {editVariant ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
