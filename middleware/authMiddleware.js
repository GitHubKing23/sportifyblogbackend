const jwt = require('jsonwebtoken');

const buildBypassUser = () => ({
  userId: 'DISABLED_AUTH_MODE',
  email: 'disabled@sportifyinsider.com',
  role: 'admin',
  name: 'Auth Disabled',
});

const logDenied = (status, req, reason, user) => {
  const email = (user && user.email) || 'unknown@user';
  const message = `[AUTH] ${status} ${req.method} ${req.originalUrl} :: ${reason} :: user=${email}`;
  if (status === 401) {
    console.warn(message);
  } else {
    console.error(message);
  }
};

const verifyToken = (req, res, next) => {
  if (process.env.DISABLE_AUTH === 'true') {
    req.user = req.user || buildBypassUser();
    return next();
  }

  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      logDenied(401, req, 'Missing bearer token');
      return res.status(401).json({ error: 'Unauthorized: Bearer token required' });
    }

    const token = authHeader.slice(7).trim();
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error('authMiddleware: JWT_ACCESS_SECRET (or JWT_SECRET) not configured');
      return res.status(500).json({ error: 'Server misconfiguration: JWT secret missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      logDenied(401, req, `Token verification failed: ${err.message}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    req.user = {
      userId: decoded.userId || decoded.sub || decoded.id || null,
      email: decoded.email || (decoded.user && decoded.user.email) || null,
      name: decoded.name || (decoded.user && decoded.user.name) || null,
      role: decoded.role || (decoded.user && decoded.user.role) || 'user',
    };

    if (!req.user.userId) {
      console.warn('[AUTH] decoded token missing userId/sub');
    }

    return next();
  } catch (err) {
    console.error('authMiddleware: unexpected error during verification', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const requireWriterOrAdmin = (req, res, next) => {
  if (process.env.DISABLE_AUTH === 'true') return next();
  if (!req.user) {
    logDenied(401, req, 'User context missing');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (['admin', 'writer'].includes((req.user.role || '').toLowerCase())) {
    return next();
  }
  logDenied(403, req, 'Writer/Admin role required', req.user);
  return res.status(403).json({ error: 'Forbidden: Writer or admin role required' });
};

const requireAdmin = (req, res, next) => {
  if (process.env.DISABLE_AUTH === 'true') return next();
  if (!req.user) {
    logDenied(401, req, 'User context missing');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if ((req.user.role || '').toLowerCase() === 'admin') {
    return next();
  }
  logDenied(403, req, 'Admin role required', req.user);
  return res.status(403).json({ error: 'Forbidden: Admin role required' });
};

module.exports = {
  verifyToken,
  requireWriterOrAdmin,
  requireAdmin,
};
