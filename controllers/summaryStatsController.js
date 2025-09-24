import { query } from "../db/db.js";

export const getSummaryStats = async (req, res) => {
  try {
    const totalUsers = await query("SELECT COUNT(*) FROM users");
    const totalAdmins = await query(
      "SELECT COUNT(*) FROM users WHERE role='admin'"
    );

    const successfulLogins = await query(
      "SELECT COUNT(*) FROM login_logs WHERE success=true"
    );

    const unsuccessfulLogins = await query(
      "SELECT COUNT(*) FROM login_logs WHERE success=false"
    );

    const blockedIps = await query(
      "SELECT COUNT(*) FROM login_logs WHERE blocked_ip='false' AND blocked=false "
    );

    res.status(200).json({
      totalUsers: Number(totalUsers.rows[0].count),
      totalAdmins: Number(totalAdmins.rows[0].count),
      successfulLogins: Number(successfulLogins.rows[0].count),
      unsuccessfulLogins: Number(unsuccessfulLogins.rows[0].count),
      blockedIps: Number(blockedIps.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const ipFails = async (req, res) => {
  try {
    const result = await query(
      `SELECT ip_address, COUNT(*) AS fails FROM login_logs WHERE success=false GROUP BY ip_address ORDER BY fails DESC LIMIT 10`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
