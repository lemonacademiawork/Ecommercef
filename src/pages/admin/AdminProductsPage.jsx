import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    active: true,
    categoryId: "",
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
        if (catRes.data.length > 0 && !productForm.categoryId) {
          setProductForm((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
        }
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        imageUrl: productForm.imageUrl,
        active: productForm.active,
        categoryId: productForm.categoryId,
      };

      let res;
      if (editProduct) {
        res = await api.products.updateProduct(editProduct.id, payload);
      } else {
        res = await api.products.createProduct(payload);
      }

      if (res.success) {
        toast.success(editProduct ? "Product updated successfully!" : "Product added successfully!");
        setShowProductForm(false);
        setEditProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          stock: "",
          imageUrl: "",
          active: true,
          categoryId: categories[0]?.id || "",
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

  const handleEditProductClick = (product) => {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || product.image || "",
      active: product.active !== undefined ? product.active : true,
      categoryId: product.categoryId || (categories[0]?.id || ""),
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.admin.uploadImage(file);
      if (res.success && res.data) {
        setProductForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch (err) {
      console.error("Image upload failed: " + err.message);
    }
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
              active: true,
              categoryId: categories[0]?.id || "",
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowProductForm(false);
                  setEditProduct(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Product Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-border text-sm"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {productForm.imageUrl && (
                  <img
                    src={productForm.imageUrl}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-lg mt-2 border border-border"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={productForm.active}
                  onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-xs font-semibold cursor-pointer">Active (Visible in Shop)</label>
              </div>

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
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {categories.find((c) => c.id === product.categoryId)?.name || product.category || "—"}
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
    </div>
  );
}
