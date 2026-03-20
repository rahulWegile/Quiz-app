import { verifyToken } from "./auth.middleware.js";

export const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    
    if ( req.user.role === "superAdmin") {
      next();
    } else {
      return res.status(403).json({ message: "Access Denied" });
    }
  });
};