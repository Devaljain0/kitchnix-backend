const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.supplier = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid or expired' });
  }
};

module.exports = auth;
