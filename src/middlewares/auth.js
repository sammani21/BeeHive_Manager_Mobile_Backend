// middlewares/auth.js
const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    req.user = decoded; // <- this is what createHive is using
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
