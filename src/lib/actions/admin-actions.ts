"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// 1. Enroll Student Action
export async function enrollStudentAction(
  name: string,
  email: string,
  password: string,
  matricNumber: string,
  batchId: string,
  programId: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    if (!name || !email || !password || !matricNumber || !batchId || !programId) {
      return { success: false, error: "Please fill out all required fields." };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email address already registered." };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User, Student, and Audit log in a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "STUDENT",
        },
      });

      await tx.student.create({
        data: {
          userId: user.id,
          matricNumber,
          batchId,
          programId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "ENROLL_STUDENT",
          details: `Enrolled student ${name} (${email}) with matric: ${matricNumber}`,
        },
      });
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Student enrollment failure:", error);
    return { success: false, error: "Failed to enroll student." };
  }
}

// 2. Enroll Mentor Action
export async function enrollMentorAction(name: string, email: string, password: string, batchIds?: string[]) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    if (!name || !email || !password) {
      return { success: false, error: "Please fill out all required fields." };
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email address already registered." };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User, Mentor, and Audit log
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "MENTOR",
        },
      });

      const mentor = await tx.mentor.create({
        data: {
          userId: user.id,
        },
      });

      if (batchIds && batchIds.length > 0) {
        await tx.batch.updateMany({
          where: { id: { in: batchIds } },
          data: { mentorId: mentor.id }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "ENROLL_MENTOR",
          details: `Registered mentor ${name} (${email})`,
        },
      });
    });

    revalidatePath("/admin/mentors");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Mentor enrollment failure:", error);
    return { success: false, error: "Failed to register mentor." };
  }
}

// 3. Create Program Action
export async function createProgramAction(
  title: string,
  description: string,
  duration: string,
  startDateInput: string,
  endDateInput: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    if (!title || !description || !duration || !startDateInput || !endDateInput) {
      return { success: false, error: "Please fill out all fields." };
    }

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { success: false, error: "Please enter valid start and end dates." };
    }

    await prisma.$transaction(async (tx) => {
      const program = await tx.program.create({
        data: {
          title,
          description,
          duration,
          startDate,
          endDate,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "CREATE_PROGRAM",
          details: `Created educational program: ${title}`,
        },
      });
    });

    revalidatePath("/admin/programs");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Program creation failure:", error);
    return { success: false, error: "Failed to create program." };
  }
}

// 4. Create Batch Action
export async function createBatchAction(
  batchCode: string,
  programId: string,
  mentorId: string | null,
  startDateInput: string,
  endDateInput: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    if (!batchCode || !programId || !startDateInput || !endDateInput) {
      return { success: false, error: "Please fill out all required fields." };
    }

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { success: false, error: "Please enter valid start and end dates." };
    }

    // Check if batchCode unique
    const existingBatch = await prisma.batch.findUnique({
      where: { batchCode },
    });

    if (existingBatch) {
      return { success: false, error: "Batch code already exists." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.batch.create({
        data: {
          batchCode,
          programId,
          mentorId: mentorId || null,
          startDate,
          endDate,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "CREATE_BATCH",
          details: `Created cohort batch ${batchCode} linked to program: ${programId}`,
        },
      });
    });

    revalidatePath("/admin/programs");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Batch creation failure:", error);
    return { success: false, error: "Failed to create batch." };
  }
}

// 5. Generate Certificate Action
export async function generateCertificateAction(studentId: string, programId: string, certNumber: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    if (!studentId || !programId || !certNumber) {
      return { success: false, error: "All arguments are required." };
    }

    // Check if certificateNumber already exists
    const existingCert = await prisma.certificate.findUnique({
      where: { certificateNumber: certNumber },
    });

    if (existingCert) {
      return { success: false, error: "Certificate number already exists." };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify?id=${certNumber}`;

    await prisma.$transaction(async (tx) => {
      await tx.certificate.create({
        data: {
          studentId,
          programId,
          certificateNumber: certNumber,
          verificationUrl,
          qrCodeData: verificationUrl,
        },
      });

      const student = await tx.student.findUnique({
        where: { id: studentId },
        include: { user: true },
      });

      if (student) {
        await tx.notification.create({
          data: {
            userId: student.userId,
            title: "Graduation Credentials Released!",
            message: `Congratulations! Your official certificate ${certNumber} has been generated. View it in the Certificates panel.`,
            type: "PLATFORM",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "RELEASE_CERTIFICATE",
          details: `Released certificate ${certNumber} to student ID: ${studentId}`,
        },
      });
    });

    revalidatePath("/admin/certificates");
    revalidatePath("/admin/students");
    revalidatePath("/student/certificates");
    return { success: true };
  } catch (error) {
    console.error("Certificate generation error:", error);
    return { success: false, error: "Failed to generate certificate." };
  }
}

// 6. Update Student Action
export async function updateStudentAction(
  studentId: string,
  name: string,
  email: string,
  matricNumber: string,
  batchId: string,
  programId: string,
  status: string,
  password?: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      return { success: false, error: "Student record not found." };
    }

    // Check email uniqueness if changing
    if (email !== student.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return { success: false, error: "Email is already in use by another account." };
      }
    }

    const updateData: any = {
      name,
      email,
      status,
    };

    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.$transaction(async (tx) => {
      // Update User
      await tx.user.update({
        where: { id: student.userId },
        data: updateData,
      });

      // Update Student
      await tx.student.update({
        where: { id: studentId },
        data: {
          matricNumber,
          batchId,
          programId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "UPDATE_STUDENT",
          details: `Updated student ${name} (${email}) profile. Status: ${status}`,
        },
      });
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update student:", error);
    return { success: false, error: "Failed to update student profile." };
  }
}

// 7. Delete Student Action
export async function deleteStudentAction(studentId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { success: false, error: "Student record not found." };
    }

    await prisma.$transaction(async (tx) => {
      // Deleting user deletes student record due to cascade constraint on schema
      await tx.user.delete({
        where: { id: student.userId },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "DELETE_STUDENT",
          details: `Deleted student record with ID: ${studentId}`,
        },
      });
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete student:", error);
    return { success: false, error: "Failed to delete student account." };
  }
}

// 8. Update Mentor Action
export async function updateMentorAction(
  mentorId: string,
  name: string,
  email: string,
  status: string,
  password?: string,
  batchIds?: string[]
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: { user: true },
    });

    if (!mentor) {
      return { success: false, error: "Mentor record not found." };
    }

    // Check email uniqueness
    if (email !== mentor.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return { success: false, error: "Email is already in use by another account." };
      }
    }

    const updateData: any = {
      name,
      email,
      status,
    };

    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: mentor.userId },
        data: updateData,
      });

      // 1. Dissociate current batches for this mentor
      await tx.batch.updateMany({
        where: { mentorId: mentorId },
        data: { mentorId: null }
      });

      // 2. Associate selected batches with this mentor
      if (batchIds && batchIds.length > 0) {
        await tx.batch.updateMany({
          where: { id: { in: batchIds } },
          data: { mentorId: mentorId }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "UPDATE_MENTOR",
          details: `Updated mentor ${name} (${email}) profile and batch allocations. Status: ${status}`,
        },
      });
    });

    revalidatePath("/admin/mentors");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update mentor:", error);
    return { success: false, error: "Failed to update mentor profile." };
  }
}

// 9. Delete Mentor Action
export async function deleteMentorAction(mentorId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      return { success: false, error: "Mentor record not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({
        where: { id: mentor.userId },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "DELETE_MENTOR",
          details: `Deleted mentor record with ID: ${mentorId}`,
        },
      });
    });

    revalidatePath("/admin/mentors");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete mentor:", error);
    return { success: false, error: "Failed to delete mentor account." };
  }
}
