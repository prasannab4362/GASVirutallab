"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function uploadStudyMaterialAction(
  title: string,
  description: string,
  fileUrl: string,
  batchId: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MENTOR" || !session.mentorId) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!title || !fileUrl || !batchId) {
      return { success: false, error: "Please provide all required fields." };
    }

    // Verify batch ownership
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch || batch.mentorId !== session.mentorId) {
      return { success: false, error: "Batch not found or unauthorized." };
    }

    const material = await prisma.studyMaterial.create({
      data: {
        title,
        description,
        fileUrl,
        batchId,
        mentorId: session.mentorId,
      },
    });

    // Notify all students in the batch
    const students = await prisma.student.findMany({
      where: { batchId },
    });

    for (const student of students) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: "New Study Material",
          message: `Your mentor posted a new resource: "${title}"`,
          type: "ALERT",
        },
      });
    }

    revalidatePath("/mentor/assignments");
    revalidatePath("/student/assignments");
    revalidatePath("/student/dashboard");

    return { success: true, material };
  } catch (error) {
    console.error("Resource upload error:", error);
    return { success: false, error: "An error occurred during upload." };
  }
}
