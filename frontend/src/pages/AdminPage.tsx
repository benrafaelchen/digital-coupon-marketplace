import { useEffect, useState, useCallback } from "react";
import {
  fetchAdminProducts,
  createAdminProduct,
  deleteAdminProduct,
} from "../services/api";
import { ProductAdmin } from "../types";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";

const EMPTY_FORM = {
  name: "",
  description: "",
  image_url: "",
  cost_price: "",
  margin_percentage: "",
  value_type: "STRING" as "STRING" | "IMAGE",
  value: "",
};

export default function AdminPage() {
  const [products, setProducts] = useState<ProductAdmin[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    fetchAdminProducts().then(setProducts).catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createAdminProduct({
        name: form.name,
        description: form.description,
        image_url: form.image_url,
        cost_price: parseFloat(form.cost_price),
        margin_percentage: parseFloat(form.margin_percentage),
        value_type: form.value_type,
        value: form.value,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const executeDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);

    try {
      await deleteAdminProduct(id);
      setToast("Coupon deleted successfully.");
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }, [deleteTarget]);

  return (
    <div>
      <div className="admin-header">
        <h2>Admin — All Products ({products.length})</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Coupon"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="admin-form">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Cost Price"
            value={form.cost_price}
            onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Margin %"
            value={form.margin_percentage}
            onChange={(e) => setForm({ ...form, margin_percentage: e.target.value })}
            required
          />
          <select
            value={form.value_type}
            onChange={(e) =>
              setForm({ ...form, value_type: e.target.value as "STRING" | "IMAGE" })
            }
          >
            <option value="STRING">STRING</option>
            <option value="IMAGE">IMAGE</option>
          </select>
          <input
            placeholder="Coupon Value (code or URL)"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            required
          />
          <button type="submit">Create Coupon</button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost</th>
              <th>Margin</th>
              <th>Sell Price</th>
              <th>Status</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 24, opacity: 0.6 }}>
                  No products yet. Click "+ New Coupon" to create one.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className={p.is_sold ? "sold-row" : ""}>
                  <td>{p.name}</td>
                  <td>${p.cost_price.toFixed(2)}</td>
                  <td>{p.margin_percentage}%</td>
                  <td>${p.minimum_sell_price.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${p.is_sold ? "status-pill--sold" : "status-pill--available"}`}>
                      {p.is_sold ? "Sold" : "Available"}
                    </span>
                  </td>
                  <td>{p.value_type}</td>
                  <td>
                    <button
                      onClick={() => setDeleteTarget(p.id)}
                      className="btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Coupon"
          message="Are you sure you want to delete this coupon? This cannot be undone."
          confirmLabel="Yes, Delete"
          cancelLabel="No"
          danger
          onConfirm={executeDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}
