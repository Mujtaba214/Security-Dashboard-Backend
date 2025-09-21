// controllers/suspiciousIpController.js
import { query } from "../db/db.js";

export const getSuspiciousIp = async (req, res) => {
  try {
    const result = await query(`
      SELECT user_id, ip_address, COUNT(*) as failed_attempts, MAX(created_at) as last_attempt
      FROM login_logs
      WHERE success = false 
        AND created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY user_id, ip_address
      HAVING COUNT(*) > 5
      ORDER BY failed_attempts DESC
    `);

    if (result.rows.length === 0) {
      return res.status(200).json({ msg: "No suspicious IPs found", suspicious_ips: [] });
    }

    res.status(200).json({
      msg: "Suspicious IPs fetched successfully",
      suspicious_ips: result.rows,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
