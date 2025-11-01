const jwt = require('jsonwebtoken');

/**
 * authenticate(requireAdmin = false)
 * - Verifies Bearer JWT and, if requireAdmin, ensures token contains an admin wallet.
 */
module.exports = function authenticate(requireAdmin = false) {
  // Fast-path: allow tests or temporary debugging to bypass auth by setting
  // DISABLE_AUTH=true in the environment. When disabled we attach a minimal
  // `req.user` object so controllers that expect an ethereumAddress won't fail.
  if (process.env.DISABLE_AUTH === 'true') {
    return (req, res, next) => {
      const adminAddr = (process.env.ADMIN_WALLET_ADDRESS || '').toLowerCase();
      if (requireAdmin && adminAddr) {
        req.user = { ethereumAddress: adminAddr };
      } else {
        req.user = { anonymous: true };
      }
      return next();
    };
  }

  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error('authMiddleware: JWT_SECRET not set in environment');
        return res.status(500).json({ error: 'Server misconfiguration: JWT secret missing' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        // helpful debug: show decoded (unverified) payload to diagnose alg/secret mismatches
        try {
          const unsafe = jwt.decode(token, { complete: true });
          console.error('authMiddleware: token verify failed. unverified token:', unsafe && unsafe.payload);
        } catch (e) {
          console.error('authMiddleware: failed to decode token for debug:', e.message);
        }
        console.error('authMiddleware: token verification failed:', err.message);
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
      }

      // Attach decoded payload for controllers to use
      req.user = decoded;

      if (requireAdmin) {
        const adminAddr = (process.env.ADMIN_WALLET_ADDRESS || '').toLowerCase();

        // accept multiple possible claim names
        const potential =
          (decoded && decoded.address) ||
          (decoded && decoded.wallet) ||
          (decoded && decoded.ethereumAddress) ||
          (decoded && decoded.ethAddress) ||
          (decoded && decoded.cmsAddress) ||
          (decoded && decoded.cms_eth_address) ||
          (decoded && decoded.sub) ||
          (decoded && decoded.user && decoded.user.address) ||
          '';

        const userAddr = String(potential).toLowerCase();

        if (!adminAddr) {
          console.error('authMiddleware: ADMIN_WALLET_ADDRESS not set in env');
          return res.status(500).json({ error: 'Server misconfiguration: admin wallet not set' });
        }

        if (!userAddr || adminAddr !== userAddr) {
          // debug log: print what was found
          try {
            const unverified = jwt.decode(token, { complete: true });
            console.error('authMiddleware DEBUG: unverified token payload:', unverified && unverified.payload);
          } catch (e) {
            console.error('authMiddleware DEBUG: failed to decode token for inspection');
          }
          console.log(`authMiddleware: forbidden wallet. allowed=${adminAddr} got=${userAddr}`);
          return res.status(403).json({ error: 'Forbidden: wallet not authorized to perform this action' });
        }
      }

      return next();
    } catch (err) {
      console.error('authMiddleware: unexpected error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
