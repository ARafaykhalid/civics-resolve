"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { signIn } from "@/lib/auth";

import { sendVerificationEmail } from "@/lib/email";

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const validated = registerSchema.parse(formData);

    await connectDB();

    const existingUser = await User.findOne({ email: validated.email });
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser) {
      if (existingUser.isVerified) {
        return { success: false, error: "An account with this email already exists" };
      } else {
        // User exists but not verified, resend code
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpires = verificationCodeExpires;
        await existingUser.save();
        
        await sendVerificationEmail(existingUser.email, verificationCode);
        return { success: true, message: "Verification code sent to your email.", isVerificationRequired: true };
      }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    await User.create({
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await sendVerificationEmail(validated.email, verificationCode);

    return { success: true, message: "Verification code sent to your email.", isVerificationRequired: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, error: (error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed") };
    }
    console.error("Registration error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function verifyUserRegistration(email: string, code: string) {
  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) return { success: false, error: "User not found" };
    if (user.isVerified) return { success: false, error: "User already verified" };
    if (user.verificationCode !== code) return { success: false, error: "Invalid verification code" };
    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return { success: false, error: "Verification code has expired" };
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return { success: true, message: "Account verified successfully" };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, error: "Verification failed. Please try again." };
  }
}

export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Invalid email or password" };
  }
}
