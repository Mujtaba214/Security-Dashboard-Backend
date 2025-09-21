import { query } from "../db/db.js";

export const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, name, email, role, last_login, failed_attempts, lock_until 
       FROM users 
       ORDER BY id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(`SELECT COUNT(*) FROM users`);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      msg: "List of users (paginated)",
      users: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(401).json({ msg: "Invalid role" });
    }
    const user = await query(`UPDATE users SET role=$1 WHERE id=$2`, [
      role,
      id,
    ]);
    res
      .status(201)
      .json({ msg: "User role updated successfully", res: user.rows });
  } catch (error) {
    return res.status(501).json({
      msg: error.message,
    });
  }
};

export const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await query(
      `UPDATE users SET failed_attempts=0,lock_until=NULL WHERE id=$1`,
      [id]
    );
    res
      .status(201)
      .json({ msg: "User account unlocked successfully", res: user.rows });
  } catch (error) {
    return res.status(501).json({
      msg: error.message,
    });
  }
};

export const deleteAUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await query(`DELETE FROM users WHERE id=$1`, [id]);
    res.status(201).json({
      msg: `User of ${id} deleted successfully`,
    });
  } catch (error) {
    return res.status(501).json({
      msg: error.message,
    });
  }
};
