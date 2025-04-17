import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  loginUserValidator,
  registerUserValidator,
} from "../validators/userValidation.js";
import { User } from "../models/user.js";
import { sendEmail } from "../utils/mailing.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { error, value } = registerUserValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Check if user already exists
    const userExisting = await User.findOne({
      $or: [{ email: value.email }, { phone: value.phone }],
    });

    if (userExisting) {
      return res.status(409).json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    // Generate profile picture using initials
    const initials = `${value.firstName.charAt(0)}${value.lastName.charAt(
      0
    )}`.toUpperCase();
    const profilePictureUrl = `https://ui-avatars.com/api/?name=${initials}&background=random`;

    // Hash password
    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    const newUser = await User.create({
      ...value,
      password: hashedPassword,
      photo: profilePictureUrl,
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
try {
    const emailSubject = "Verify Your TutorConnect Account";
    const verificationUrl = `${process.env.BACKEND_URL || 'https://yourfrontend.com'}/verify-email?token=${verificationToken}`;
    
    const emailBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .logo {
          max-width: 150px;
        }
        .button {
          display: inline-block;
          background-color: rgb(7, 68, 146);
          color: white !important;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .content {
          background-color: #f9f9f9;
          padding: 25px;
          border-radius: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #777;
          font-size: 14px;
        }
        .code {
          font-family: monospace;
          background: #f0f0f0;
          padding: 5px 10px;
          border-radius: 3px;
          color: #d63384;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://yourlogo.com/logo.png" alt="TutorConnect Logo" class="logo">
      </div>
      
      <div class="content">
        <h2>Welcome to TutorConnect, ${newUser.firstName}!</h2>
        <p>Thank you for creating an account. Please verify your email address to get started.</p>
        
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
        
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}" style="word-break: break-all;">${verificationUrl}</a></p>
        
        <p>If you didn't create this account, you can safely ignore this email.</p>
      </div>
      
      <div class="footer">
        <p>TutorConnect - Connecting students and tutors</p>
        <p>© ${new Date().getFullYear()} TutorConnect. All rights reserved.</p>
        <p>
          <a href="https://tutorconnect.com/privacy" style="color: #777; text-decoration: none;">Privacy Policy</a> | 
          <a href="https://tutorconnect.com/terms" style="color: #777; text-decoration: none;">Terms of Service</a>
        </p>
      </div>
    </body>
    </html>
    `;
  
      await sendEmail(newUser.email, emailSubject, emailBody);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        photo: newUser.photo,
        isVerified: newUser.isVerified,
        verificationToken: verificationToken,
        verificationUrl: `${process.env.BACKEND_URL}/verify-email?token=${verificationToken}`,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify user's email
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Find user by token and check expiration
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark user as verified and clear token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send welcome email after verification
    try {
      const emailSubject = "Welcome to TutorConnect!";
      const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TutorConnect</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
          .header { background-color:rgb(18, 30, 201); color: white; padding: 15px; text-align: center; font-size: 24px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; color: #333; line-height: 1.6; }
          .button { display: inline-block; background-color: rgb(18, 30, 201); color: white; text-decoration: none; padding: 10px 15px; border-radius: 5px; margin-top: 10px; }
          .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Welcome to TutorConnect, ${user.firstName}!</div>
          <div class="content">
            <h2>Your account is now verified!</h2>
            <p>You can now enjoy all the features of TutorConnect.</p>
            ${
              user.role === "tutor"
                ? `
            <p>As a tutor, you can:</p>
            <ul>
              <li>Create your tutor profile</li>
              <li>Connect with students</li>
              <li>Schedule tutoring sessions</li>
            </ul>
            `
                : `
            <p>As a student, you can:</p>
            <ul>
              <li>Find qualified tutors</li>
              <li>Join study groups</li>
              <li>Book learning sessions</li>
            </ul>
            `
            }
          </div>
          <div class="footer">
            <p>Need help? Contact our support team</p>
          </div>
        </div>
      </body>
      </html>
      `;

      await sendEmail(user.email, emailSubject, emailBody);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during verification",
    });
  }
};

// // Resend verification email
// export const resendVerificationEmail = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is already verified",
//       });
//     }

//     // Generate new verification token
//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     user.verificationToken = verificationToken;
//     user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//     await user.save();

//     // Send verification email with Postman instructions
//     const emailSubject = "Your New Verification Code";
//     const emailBody = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; }
//         .code { 
//           font-size: 24px; 
//           font-weight: bold; 
//           color:rgb(18, 0, 175);
//           margin: 20px 0;
//           padding: 10px;
//           background: #f8f8f8;
//           display: inline-block;
//         }
//       </style>
//     </head>
//     <body>
//       <h2>Hi ${user.firstName},</h2>
//       <p>Here's your new verification token:</p>
//       <div class="code">${verificationToken}</div>
//       <p>Use this in Postman to verify your account:</p>
//       <p>GET: <code>${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}</code></p>
//       <p>Or POST to <code>/api/auth/verify-email</code> with body: <code>{"token": "${verificationToken}"}</code></p>
//     </body>
//     </html>
//     `;

//     await sendEmail(user.email, emailSubject, emailBody);

//     res.status(200).json({
//       success: true,
//       message: "Verification email resent successfully",
//       data: {
//         verificationToken: verificationToken,
//       },
//     });
//   } catch (error) {
//     console.error("Resend verification error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to resend verification email",
//     });
//   }
// };

// Login user
export const loginUser = async (req, res) => {
  try {
    const { error, value } = loginUserValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Find user
    const user = await User.findOne({ email: value.email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address first",
        isVerified: user.isVerified,
        verificationToken: user.verificationToken,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        photo: user.photo,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
