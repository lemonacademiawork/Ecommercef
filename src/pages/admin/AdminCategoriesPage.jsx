import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { api } from "../../services/api";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    imageUrl: "",
    active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const catRes = await api.categories.listCategories(true);
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.admin.uploadImage(file);
      if (res.success && res.data) {
        setCategoryForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch (err) {
      console.error("Image upload failed: " + err.message);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: categoryForm.name,
        imageUrl: categoryForm.imageUrl,
        image: categoryForm.imageUrl,
        active: categoryForm.active,
      };

      let res;
      if (editCategory) {
        try {
          res = await api.categories.updateCategory(editCategory.id, payload);
        } catch (err) {
          // If the backend uniqueness check throws an error on update for the same name,
          // attempt a partial update by omitting the name field if the name hasn't changed.
          if (err.message.includes("already exists") && categoryForm.name.trim().toLowerCase() === editCategory.name.trim().toLowerCase()) {
            const { name, ...partialPayload } = payload;
            res = await api.categories.updateCategory(editCategory.id, partialPayload);
          } else {
            throw err;
          }
        }
      } else {
        res = await api.categories.createCategory(payload);
      }

      if (res.success) {
        setShowCategoryForm(false);
        setEditCategory(null);
        setCategoryForm({
          name: "",
          imageUrl: "",
          active: true,
        });
        loadData();
      }
    } catch (err) {
      console.error("Failed to save category: " + err.message);
    }
  };

  const handleEditCategoryClick = (cat) => {
    setEditCategory(cat);
    setCategoryForm({
      name: cat.name,
      imageUrl: cat.imageUrl || cat.image || "",
      active: cat.active !== undefined ? cat.active : true,
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This might affect products under this category!")) return;
    try {
      const res = await api.categories.deleteCategory(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete category: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading categories...</p>
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
          Categories
        </h1>
        <button
          onClick={() => {
            setEditCategory(null);
            setCategoryForm({
              name: "",
              imageUrl: "",
              active: true,
            });
            setShowCategoryForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #a61c9b, #d82a81)",
          }}
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                {editCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditCategory(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Category Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={categoryForm.imageUrl}
                    onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-border text-sm"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {categoryForm.imageUrl && (
                  <img
                    src={categoryForm.imageUrl}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-lg mt-2 border border-border"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={categoryForm.active}
                  onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                />
                <label htmlFor="cat-active" className="text-xs font-semibold cursor-pointer">Active (Visible in Shop)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditCategory(null);
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
                  Category
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
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.imageUrl || cat.image}
                        alt={cat.name}
                        className="w-9 h-9 rounded-lg object-cover bg-muted flex-shrink-0"
                      />
                      <span className="font-medium">
                        {cat.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {cat.active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategoryClick(cat)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
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
