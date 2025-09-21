import bcrypt from "bcryptjs";
import { query } from "../db/db.js";
import jwt from "jsonwebtoken";
import env from "dotenv";
import crypto from "crypto";
import {
  sendEmail,
  sendLoginEmail,
  sendPasswordResetEmail,
} from "../utils/mailer.js";

env.config();

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Fetch user from DB
    const userResult = await query(`SELECT * FROM users WHERE email=$1`, [
      email,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: "No user found" });
    }

    const user = userResult.rows[0];
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] || // if behind proxy/load balancer
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "unknown";

    console.log("Detected IP:", ipAddress);

    const userAgent = req.headers["user-agent"] || "Unknown";

    // 2️⃣ Check if account is locked
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      return res.status(403).json({
        msg: `Account locked. Try again after ${user.lock_until}`,
      });
    }

    // 3️⃣ Validate password
    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      const failedAttempt = user.failed_attempts + 1;

      if (failedAttempt >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 min
        await query(
          `UPDATE users SET failed_attempts=$1, lock_until=$2 WHERE id=$3`,
          [failedAttempt, lockUntil, user.id]
        );

        await query(
          `INSERT INTO login_logs(user_id,success,ip_address,user_agent) VALUES ($1,$2,$3,$4)`,
          [user.id, false, ipAddress, userAgent]
        );

        console.log("Email before sending:", user.email);
        console.log("Type:", typeof user.email);

        return res.status(401).json({
          msg: "Too many failed attempts. Account locked for 15 minutes. An email has been sent.",
        });
      } else {
        await query(`UPDATE users SET failed_attempts=$1 WHERE id=$2`, [
          failedAttempt,
          user.id,
        ]);

        await query(
          `INSERT INTO login_logs(user_id,success,ip_address,user_agent) VALUES ($1,$2,$3,$4)`,
          [user.id, false, ipAddress, userAgent]
        );

        return res.status(401).json({ msg: "Invalid email and password" });
      }
    }

    // 4️⃣ Reset failed attempts on successful login
    await query(
      `UPDATE users SET failed_attempts=0, lock_until=NULL, last_login=NOW() WHERE id=$1`,
      [user.id]
    );

    await query(
      `INSERT INTO login_logs(user_id,success,ip_address,user_agent) VALUES($1,$2,$3,$4)`,
      [user.id, true, ipAddress, userAgent]
    );

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    const now = new Date();

    const currentDate = now.toLocaleDateString("en-GB");
    const currentTime = now.toLocaleDateString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    await sendLoginEmail(user.email, user.name,currentTime);

    // 6️⃣ Send responsecu
    return res.status(200).json({
      msg: "User logged in successfully",
      id: user.id,
      jwtToken: token,
      name: user.name,
      role: user.role,
      email: user.email,
      password: user.password,
      attempts: user.failed_attempts,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(401)
        .json({ msg: "Both current and new passwords are required" });
    }

    const userResult = await query(`SELECT * FROM users WHERE id=$1`, [
      id, // here user is coming from jwtMiddleware
    ]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ msg: "No user found" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Current password don't matches" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password=$1 WHERE id=$2`, [
      hashedNewPassword,
      id,
    ]);

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userResult = await query(`SELECT * FROM users WHERE email=$1`, [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: "No user with this email" });
    }

    const user = userResult.rows[0];

    const resetToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    await query(
      `UPDATE users SET reset_token=$1, reset_token_expires=NOW() + INTERVAL '15 minutes' WHERE id=$2`,
      [resetToken, user.id]
    );

    const resetTokenUpdate = `${resetToken} use this token to reset your password.`;
    await sendPasswordResetEmail(email, resetTokenUpdate);

    res.status(200).json({ msg: "Reset link sent to your email" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      `UPDATE users SET password=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2`,
      [hashedPassword, decoded.id]
    );

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};

