import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import CustomerPage from "./pages/CustomerPage";

type Mode = "customer" | "admin";

export default function App() {
  const [mode, setMode] = useState<Mode>("customer");

  return (
    <div className="app">
      <header>
        <h1>Coupon Marketplace</h1>
        <nav>
          <button
            className={mode === "customer" ? "active" : ""}
            onClick={() => setMode("customer")}
          >
            Customer
          </button>
          <button
            className={mode === "admin" ? "active" : ""}
            onClick={() => setMode("admin")}
          >
            Admin
          </button>
        </nav>
      </header>
      <main>
        {mode === "customer" ? <CustomerPage /> : <AdminPage />}
      </main>
    </div>
  );
}
