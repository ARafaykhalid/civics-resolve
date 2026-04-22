"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { signIn } from "@/lib/auth";

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const validated = registerSchema.parse(formData);

    await connectDB();

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    await User.create({
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      role: "user",
    });

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: "Validation failed. Please check your inputs." };
    }
    console.error("Registration error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
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
