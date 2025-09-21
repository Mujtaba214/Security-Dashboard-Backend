import { query } from "../db/db.js";

export const getProfile = async (req, res) => {
  try {
    const user = await query(
      "SELECT id, name, email, role, last_login FROM users WHERE id = $1",
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: "No profile found" });
    }

    res.json({
      msg: "Profile fetched successfully",
      user: user.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      msg: "Unable to fetch",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !!email) {
      return res.status(400).json({ msg: "Nothing to update" });
    }
    const result = await query(
      `
            UPDATE users SET name = COALESCE($1,name),email = COALESCE($2,email) WHERE id=$3
            RETURNING id,name,email,role
            `,
      [name, email, req.user.id]
    );
    if (result.rows.length === 0) {
      res.status(401).json({
        msg: "No user found",
      });
    }
    res.status(200).json({
      msg: "Profile updated successfully",
      User: result.rows[0],
    });
  } catch (error) {
    res.status(501).json({
      msg: error.message,
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const result = await query(
      `
            DELETE FROM users WHERE id=$1 RETURNING id`,
      [req.user.id]
    );
    if (result.rows[0] === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "Profile deleted successfully",
      deletedUser: result.rows[0],
    });
  } catch (error) {
    res.status(501).json({
      msg: error.message,
    });
  }
};
