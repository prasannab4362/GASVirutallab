"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMeetingAction(
  title: string,
  description: string,
  batchId: string,
  dateInput: string,
  durationInput: number,
  joinUrl: string,
  notes?: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MENTOR" || !session.mentorId) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!title || !batchId || !dateInput || !durationInput || !joinUrl) {
      return { success: false, error: "Please fill out all required meeting details." };
    }

    const duration = Number(durationInput);
    if (isNaN(duration) || duration <= 0) {
      return { success: false, error: "Duration must be a positive number." };
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return { success: false, error: "Please enter a valid date and time." };
    }

    // Create the meeting
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        batchId,
        mentorId: session.mentorId,
        date,
        duration,
        joinUrl,
        notes,
        status: "SCHEDULED",
      },
    });

    // Notify all students in this batch
    const students = await prisma.student.findMany({
      where: { batchId },
    });

    // Send notification to students
    await Promise.all(
      students.map((student) =>
        prisma.notification.create({
          data: {
            userId: student.userId,
            title: "New Cohort Meeting",
            message: `A new live sync "${title}" has been scheduled for ${date.toLocaleString()}`,
            type: "MEETING",
          },
        })
      )
    );

    revalidatePath("/mentor/meetings");
    revalidatePath("/mentor/dashboard");
    revalidatePath("/student/meetings");
    revalidatePath("/student/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to schedule meeting:", error);
    return { success: false, error: "An error occurred while scheduling." };
  }
}
