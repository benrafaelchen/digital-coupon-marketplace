import express from "express";
import cors from "cors";
import resellerRoutes from "./routes/reseller.routes";
import adminRoutes from "./routes/admin.routes";
import customerRoutes from "./routes/customer.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Route groups
app.use("/api/v1", resellerRoutes);       // Reseller API (Bearer auth)
app.use("/api/admin", adminRoutes);        // Admin CRUD
app.use("/api/customer", customerRoutes);  // Direct customer (frontend)

// Global error handler — must be registered after all routes
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});

export default app;
