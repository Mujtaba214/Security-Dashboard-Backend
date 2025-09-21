import { query } from "../db/db.js";

export const blockIP = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `
        UPDATE login_logs
        SET blocked = true WHERE id=$1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "No log found" });
    }
    res.status(200).json({ msg: "IP blocked successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const unBlockIP = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `
        UPDATE login_logs
        SET blocked = false WHERE id=$1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "No log found" });
    }
    res.status(200).json({ msg: "IP unblocked successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
