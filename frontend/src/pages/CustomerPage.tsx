import { useEffect, useState, useCallback } from "react";
import { fetchCustomerProducts, purchaseProduct } from "../services/api";
import { ProductCustomer, PurchaseResult } from "../types";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CustomerPage() {
  const [products, setProducts] = useState<ProductCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ProductCustomer | null>(null);

  const load = () => {
    setLoading(true);
    fetchCustomerProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const executePurchase = useCallback(async () => {
    if (!confirmTarget) return;
    const product = confirmTarget;
    setConfirmTarget(null);

    try {
      setError("");
      const result = await purchaseProduct(product.id);
      setPurchaseResult(result);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }, [confirmTarget]);

  return (
    <div>
      <h2>Coupon Store</h2>

      {error && <div className="error">{error}</div>}

      {purchaseResult && (
        <div className="success-card">
          <h3>Purchase Successful!</h3>
          <p><strong>Price Paid:</strong> ${purchaseResult.final_price.toFixed(2)}</p>
          <p><strong>Coupon Type:</strong> {purchaseResult.value_type}</p>
          {purchaseResult.value_type === "STRING" ? (
            <p><strong>Coupon Code:</strong> <code>{purchaseResult.value}</code></p>
          ) : (
            <div>
              <strong>Coupon Image:</strong>
              <br />
              <img src={purchaseResult.value} alt="Coupon" className="coupon-reveal-img" />
            </div>
          )}
          <button onClick={() => setPurchaseResult(null)} style={{ marginTop: 12 }}>
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading coupons...</p>
      ) : products.length === 0 ? (
        <p>No coupons available.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div
              key={p.id}
              className={`product-card${p.is_sold ? " product-card--sold" : ""}`}
            >
              <div className="product-card__img-wrap">
                <img src={p.image_url} alt={p.name} />
                {p.is_sold && <span className="sold-badge">SOLD</span>}
              </div>
              <div className="product-card__body">
                <h3>{p.name}</h3>
                <p className="product-card__desc">{p.description}</p>
                <p className="price">${p.price.toFixed(2)}</p>
                <button
                  onClick={() => setConfirmTarget(p)}
                  disabled={p.is_sold}
                >
                  {p.is_sold ? "Sold Out" : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Confirm Purchase"
          message={`Purchase "${confirmTarget.name}" for $${confirmTarget.price.toFixed(2)}?`}
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={executePurchase}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
