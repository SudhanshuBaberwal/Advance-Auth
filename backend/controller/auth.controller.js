import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookir.js";
import { sendVerificationEmail } from "../mailtrap/email.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../mailtrap/email.js";
import { sendResetSuccessEmail } from "../mailtrap/email.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fileds are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken: verificationCode,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    await user.save();

    //jwt
    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email, verificationCode);

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  // 1 2 3 4 5 6
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expires verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user.doc,
        password: undefined,
      },
    });
  } catch (error) {}
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "User Logged In Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in Login Function", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "User Logout Successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return req.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000; // 1 Hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpireAt;
    await user.save();

    // Send Email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email has sent successfully on your email.",
    });
  } catch (error) {
    console.log("Error in forgot Password function", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expire reset token",
      });
    }

    // update-password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log("Error in reset password function", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {}
};
