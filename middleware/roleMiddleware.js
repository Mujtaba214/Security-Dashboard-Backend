export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ msg: "Access denied: insufficient role" });
    }
    next();
  };
};
