import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import dashboardRoutes from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
