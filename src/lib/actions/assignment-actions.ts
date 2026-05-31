"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createAssignmentAction(
  title: string,
  description: string,
  deadline: string,
  batchId: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MENTOR" || !session.mentorId) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!title || !description || !deadline || !batchId) {
      return { success: false, error: "Please provide all required assignment fields." };
    }

    // Verify batch ownership (must be mentor's batch)
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch || batch.mentorId !== session.mentorId) {
      return { success: false, error: "Batch not found or unauthorized." };
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        batchId,
        status: "ACTIVE",
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
          title: "New Cohort Assignment",
          message: `A new assignment "${title}" has been posted. Deadline: ${new Date(deadline).toLocaleDateString()}`,
          type: "ALERT",
        },
      });
    }

    revalidatePath("/mentor/assignments");
    revalidatePath("/student/assignments");
    revalidatePath("/student/dashboard");

    return { success: true, assignment };
  } catch (error) {
    console.error("Assignment creation error:", error);
    return { success: false, error: "An error occurred during assignment creation." };
  }
}
