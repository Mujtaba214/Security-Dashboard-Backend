import express from "express";
import env from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { apiLimiter } from "./middleware/rateLimit.js";

env.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
const allowedOrigins = [
  "https://securitydashboardinfo.netlify.app", // Your deployed frontend URL
  "http://localhost:5173", // Local development URL
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable cookies if needed
};

app.use(cors(corsOptions));

app.use("/api", authRoutes, apiLimiter);
app.use("/user", userRoutes, apiLimiter);
app.use("/admin", adminRoutes, apiLimiter);
app.use("/test", testRoutes, apiLimiter);

app.listen(port, () => {
  console.log("server running");
});
