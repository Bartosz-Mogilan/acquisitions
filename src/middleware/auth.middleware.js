import logger from "#config/logger.js";
import { jwttoken } from "#utils/jwt.js";

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No access token provided'
            });
        }

        const decoded = jwttoken.verify(token);
        req.user = decoded;

        logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
        next();
    } catch (e){
        logger.error('Authentication error:', e);
        return res.status(500).json({
            error: "Internal server error",
            message: "Error verifying authentication token",
        });
    }
};

export const requiredRole = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          message: "No authenticated user",
        });
      }

      if (req.user.role !== role) {
        logger.warn(`User ${req.user.email ?? req.user.id} forbidden - requires role: ${role}`);
        return res.status(403).json({
          error: "Forbidden",
          message: "Insufficient privileges",
        });
      }

      return next();
    } catch (e) {
      logger.error("requiredRole middleware error", e);
      return res.status(500).json({
        error: "Internal server error",
        message: "Role check failed",
      });
    }
  };
};