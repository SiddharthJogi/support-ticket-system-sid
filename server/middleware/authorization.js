/* server/middleware/authorization.js */
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // 1. Get token from header (Format: "Bearer <token>")
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Not Authorized: No Token");
    }

    // 2. Verify validity
    // (Ensure your JWT_SECRET in .env matches what you used in auth.js)
    const payload = jwt.verify(jwtToken, "sud_life_super_secret_key_123");

    // 3. Attach user info to the request so routes can use it
    req.user = payload; 
    
    next(); // Continue to the actual route
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not Authorized: Invalid Token");
  }
};