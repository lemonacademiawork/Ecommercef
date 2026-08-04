import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Upload, Layers, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";
import SearchInput from "../../components/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
          <div className="h-3 w-28 rounded bg-muted" />
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-5 w-14 rounded-full bg-muted" /></td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted" />
          <div className="w-7 h-7 rounded-lg bg-muted" />
        </div>
      </td>
    </tr>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({ category, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ fontFamily: "Poppins, sans-serif" }}>
              Delete Category?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{category?.name}"</span>?
              This may affect products in this category.
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
export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search: local input → debounced → API
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.categories.listCategories(true, debouncedSearch);
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        toast.error(res.message || "Failed to load categories");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.admin.uploadImage(file);
      if (res.success && res.data) {
        setCategoryForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
        toast.success("Image uploaded!");
      } else {
        toast.error("Image upload failed");
      }
    } catch (err) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) { toast.error("Category name is required"); return; }

    setSubmitting(true);
    try {
      const payload = {
        name: categoryForm.name,
        description: categoryForm.description,
        imageUrl: categoryForm.imageUrl,
        image: categoryForm.imageUrl,
        active: categoryForm.active,
      };

      let res;
      if (editCategory) {
        try {
          res = await api.categories.updateCategory(editCategory.id, payload);
        } catch (err) {
          // If backend rejects same name on update, retry without name field
          if (err.message?.includes("already exists") && categoryForm.name.trim().toLowerCase() === editCategory.name.trim().toLowerCase()) {
            const { name, ...partial } = payload;
            res = await api.categories.updateCategory(editCategory.id, partial);
          } else {
            throw err;
          }
        }
      } else {
        res = await api.categories.createCategory(payload);
      }

      if (res.success !== false) {
        toast.success(editCategory ? "Category updated!" : "Category created!");
        setShowCategoryForm(false);
        setEditCategory(null);
        setCategoryForm({ name: "", description: "", imageUrl: "", active: true });
        loadData();
      } else {
        toast.error(res.message || "Failed to save category");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.imageUrl || cat.image || "",
      active: cat.active !== undefined ? cat.active : true,
    });
    setShowCategoryForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.categories.deleteCategory(deleteTarget.id);
      if (res.success !== false) {
        toast.success(`"${deleteTarget.name}" deleted`);
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(res.message || "Failed to delete category");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
          Categories
        </h1>
        <button
          onClick={() => {
            setEditCategory(null);
            setCategoryForm({ name: "", description: "", imageUrl: "", active: true });
            setShowCategoryForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-4 shadow-sm">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => setSearchInput("")}
          isLoading={loading && !!debouncedSearch}
          placeholder="Search categories by name…"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f8f9fc" }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : categories.length === 0
                ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        {debouncedSearch
                          ? `No results found matching "${debouncedSearch}"`
                          : "No categories yet"}
                      </p>
                    </td>
                  </tr>
                )
                : categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl || cat.image
                          ? <img src={cat.imageUrl || cat.image} alt={cat.name} className="w-9 h-9 rounded-lg object-cover bg-muted flex-shrink-0 border border-border" />
                          : <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">{cat.icon || "📦"}</div>
                        }
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cat.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {cat.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(cat)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Count footer */}
        {!loading && (
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{categories.length}</span> categories
              {debouncedSearch && <span className="text-muted-foreground"> matching "{debouncedSearch}"</span>}
            </p>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <DeleteConfirmDialog
          category={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* ── Create/Edit Modal ── */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                {editCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                type="button"
                onClick={() => { setShowCategoryForm(false); setEditCategory(null); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  placeholder="e.g. Resin Supplies"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this category"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-semibold mb-1">Category Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={categoryForm.imageUrl}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, imageUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-xl border border-border text-sm"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold cursor-pointer whitespace-nowrap">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {categoryForm.imageUrl && (
                  <img src={categoryForm.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg mt-2 border border-border" />
                )}
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="cat-active"
                  checked={categoryForm.active}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, active: e.target.checked }))}
                />
                <label htmlFor="cat-active" className="text-xs font-semibold cursor-pointer">
                  Active (visible in shop)
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCategoryForm(false); setEditCategory(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
