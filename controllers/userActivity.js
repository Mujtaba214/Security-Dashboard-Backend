import { query } from "../db/db.js";

export const userActivity = async (req, res) => {
  try {
    const result = await query(`
            SELECT * FROM login_logs
            `);
    res
      .status(200)
      .json({
        msg: "User activity fetched successfully",
        activity: result.rows,
      });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
