// middleware/jwtMiddleware.js
import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

export const jwtMiddleware = (req, res, next) => {
  try {
    // 1. Get header
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, msg: "Malformed token" });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded Payload:", decoded);

    // 4. Check if payload contains required fields
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ success: false, msg: "Invalid token payload" });
    }

    // 5. Attach to req.user so routes can use it
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // 6. Call next middleware
    next();
  } catch (err) {
    console.error("JWT Middleware Error:", err.message);
    return res.status(401).json({
      success: false,
      msg: "Token verification failed",
      error: err.message,
    });
  }
};
