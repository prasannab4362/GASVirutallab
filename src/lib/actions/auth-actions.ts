"use server";

import prisma from "@/lib/db";
import { setSession, destroySession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const selectedRole = formData.get("role") as string; // STUDENT, MENTOR, ADMIN

    if (!email || !password || !selectedRole) {
      return { success: false, error: "Please fill out all fields." };
    }

    // Query user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        mentor: true,
      },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Verify role selection matches database
    if (user.role !== selectedRole) {
      return { success: false, error: `Invalid role selected for this account.` };
    }

    if (user.role === "STUDENT" && !user.student) {
      return { success: false, error: "Student profile is incomplete. Please contact support." };
    }

    if (user.role === "MENTOR" && !user.mentor) {
      return { success: false, error: "Mentor profile is incomplete. Please contact support." };
    }

    // Verify status is active
    if (user.status !== "ACTIVE") {
      return { success: false, error: "This account has been suspended." };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password." };
    }

    // Prepare session payload
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentId: user.student?.id || undefined,
      mentorId: user.mentor?.id || undefined,
      batchId: user.student?.batchId || undefined,
      programId: user.student?.programId || undefined,
      createdAt: Date.now(),
    };

    // Set cookie session
    await setSession(sessionPayload);

    // Return redirection URL
    let redirectUrl = "/student/dashboard";
    if (user.role === "MENTOR") redirectUrl = "/mentor/dashboard";
    if (user.role === "ADMIN") redirectUrl = "/admin/dashboard";

    return { success: true, redirectUrl };
  } catch (error: any) {
    console.error("Login action failure:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}
