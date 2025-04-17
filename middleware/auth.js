import { expressjwt } from "express-jwt";
import { User } from "../models/user.js";

export const isAuthenticated = expressjwt({
    secret: process.env.JWT_SECRET_KEY,
    algorithms: ['HS256'],
    requestProperty: 'auth'
});


//authorization
export const isAuthorized = (roles) => {
    return async (req, res, next) => {
        try{
            const user = await User.findById(req.auth.id);
            if(!user) {
                return res.status(404).json('User not found');
            }

            if(!roles.includes(user.role)) {
                return res.status(403).json('You are not authorized')
            }
            next();
        } catch(error) {
            console.error('Authorization error:', error);
            res.status(500).json('Authorization error')
        }
    };
};

// Middleware to check if user is a verified tutor
export const isVerifiedTutor = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== 'tutor') {
      return res.status(403).json({
        success: false,
        message: "Access restricted to tutors only"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account to access this feature"
      });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    console.error("Tutor verification check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
