import { query } from "../db/db.js";

export const getSecurityMetrics = async (req, res) => {
  try {
    // Active Threats (IPs with >5 failed attempts in last hour)
    const threatsResult = await query(`
      SELECT COUNT(*) 
      FROM (
        SELECT ip_address
        FROM login_logs
        WHERE success = false
          AND created_at >= NOW() - INTERVAL '1 hour'
        GROUP BY ip_address
        HAVING COUNT(*) > 5
      ) AS suspicious_ips;
    `);
    const activeThreats = parseInt(threatsResult.rows[0].count, 10);

    // Suspicious IPs (distinct IPs with failed logins in last hour)
    const suspiciousIpResults = await query(`
      SELECT COUNT(DISTINCT ip_address) AS count
      FROM login_logs
      WHERE success = false
        AND created_at >= NOW() - INTERVAL '1 hour';
    `);
    const suspiciousIps = parseInt(suspiciousIpResults.rows[0].count, 10);

    // Failed Logins in last 24h
    const failedLoginResult = await query(`
      SELECT COUNT(*) 
      FROM login_logs
      WHERE success = false
        AND created_at >= NOW() - INTERVAL '24 hours';
    `);
    const failedLogins = parseInt(failedLoginResult.rows[0].count, 10);

    // TODO: Blocked accounts if you add a "blocked" column in users
    const blockedAccounts = 0;

    const metrics = {
      activeThreats,
      suspiciousIps,
      failedLogins,
      blockedAccounts,
    };

    res.status(200).json({ msg: "Metrics fetched successfully", metrics });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ msg: error.message });
  }
};
