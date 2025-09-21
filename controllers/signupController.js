import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../db/db.js";
import { sendEmail } from "../utils/mailer.js";

export const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await query(
      `INSERT INTO users(name,email,password) VALUES ($1,$2,$3) RETURNING *`,
      [name, email, hashedPassword]
    );
    
    await sendEmail(email, name);
    res
      .status(200)
      .json({ msg: "User created successfully", user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
