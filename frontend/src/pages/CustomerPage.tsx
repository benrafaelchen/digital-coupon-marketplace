import { useEffect, useState } from "react";
import { fetchCustomerProducts, purchaseProduct } from "../services/api";
import { ProductPublic, PurchaseResult } from "../types";

export default function CustomerPage() {
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);

  const load = () => {
    setLoading(true);
    fetchCustomerProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePurchase = async (id: string) => {
    try {
      setError("");
      const result = await purchaseProduct(id);
      setPurchaseResult(result);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h2>Available Coupons</h2>

      {error && <div className="error">{error}</div>}

      {purchaseResult && (
        <div className="success-card">
          <h3>Purchase Successful!</h3>
          <p><strong>Product ID:</strong> {purchaseResult.product_id}</p>
          <p><strong>Price Paid:</strong> ${purchaseResult.final_price.toFixed(2)}</p>
          <p><strong>Coupon Type:</strong> {purchaseResult.value_type}</p>
          {purchaseResult.value_type === "STRING" ? (
            <p><strong>Coupon Code:</strong> <code>{purchaseResult.value}</code></p>
          ) : (
            <div>
              <strong>Coupon Image:</strong>
              <br />
              <img src={purchaseResult.value} alt="Coupon" style={{ maxWidth: 200, marginTop: 8 }} />
            </div>
          )}
          <button onClick={() => setPurchaseResult(null)} style={{ marginTop: 12 }}>
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No coupons available.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <img src={p.image_url} alt={p.name} />
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="price">${p.price.toFixed(2)}</p>
              <button onClick={() => handlePurchase(p.id)}>Purchase</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
