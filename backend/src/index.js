import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import detect from "detect-port";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import grammarRoutes from "./routes/grammar.js";
import courseRoutes from "./routes/courseRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import userManagementRoutes from "./routes/userManagementRoutes.js";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import createAdminUser from "./utils/seedAdmin.js";
import cleanupDemoUsers from "./utils/cleanupDemoUsers.js";

dotenv.config();

// Ensure required secrets exist
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in environment variables (.env). Please set a strong secret and restart the server.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ===== MongoDB Connect =====
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "EnglishAI"
  })
  .then(async () => {
    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.db.databaseName);
    await createAdminUser();
    await cleanupDemoUsers();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===== Middleware =====
// CORS - Cho phép tất cả localhost
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:5173', // Vite dev server
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Thêm middleware để handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Routes =====
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 English AI Backend đang hoạt động!",
    version: "1.0.0",
    features: [
      "✅ Đăng ký/Đăng nhập người dùng",
      "✅ Xác thực JWT Token", 
      "✅ Tài khoản Admin tự động",
      "✅ Kết nối MongoDB Atlas",
      "✅ Mã hóa mật khẩu bcrypt"
    ],
    endpoints: {
      auth: "/api/auth",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login", 
      profile: "GET /api/auth/profile",
      courses: "/api/courses",
      createCourse: "POST /api/courses (Admin only)",
      getCourses: "GET /api/courses"
    },
    adminAccount: {
      email: "nvdoi2402@gmail.com",
      password: "123456",
      role: "admin"
    }
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/grammar", grammarRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/users", userManagementRoutes);
app.use("/api/vocabularies", vocabularyRoutes);
app.use("/api/stats", statsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ===== Dynamic Port Check =====
detect(PORT).then((_port) => {
  if (PORT == _port) {
    app.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } else {
    console.warn(
      `⚠️ Port ${PORT} is already in use, switching to port ${_port} instead.`
    );
    app.listen(_port, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${_port}`);
    });
  }
});

