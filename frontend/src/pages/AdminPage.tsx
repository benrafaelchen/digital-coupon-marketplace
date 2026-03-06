import { useEffect, useState } from "react";
import {
  fetchAdminProducts,
  createAdminProduct,
  deleteAdminProduct,
} from "../services/api";
import { ProductAdmin } from "../types";

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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteAdminProduct(id);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin — All Products</h2>
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

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost</th>
            <th>Margin %</th>
            <th>Sell Price</th>
            <th>Sold</th>
            <th>Value Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.is_sold ? "sold-row" : ""}>
              <td>{p.name}</td>
              <td>${p.cost_price.toFixed(2)}</td>
              <td>{p.margin_percentage}%</td>
              <td>${p.minimum_sell_price.toFixed(2)}</td>
              <td>{p.is_sold ? "Yes" : "No"}</td>
              <td>{p.value_type}</td>
              <td>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
