import { query } from "../db/db.js";

export const detectThreats = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, user_id, ip_address, success, created_at
      FROM login_logs
      WHERE success = false
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      return res.status(200).json({ msg: "No threats detected", threats: [] });
    }

    const threats = result.rows.map((row) => ({
      id: row.id,
      type: "Failed Login Attempt",
      userId: row.user_id,
      ip: row.ip_address,
      severity: "High",
      status: "Active",
      timeStamp: row.created_at,
    }));

    res.status(200).json({ msg: "Threats fetched successfully", threats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};
