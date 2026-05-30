"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitAssignmentAction(
  assignmentId: string,
  fileName: string,
  fileUrl: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || !session.studentId) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!assignmentId || !fileName || !fileUrl) {
      return { success: false, error: "Please provide all required submission details." };
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return { success: false, error: "Assignment not found." };
    }

    // Check if there is an existing submission
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: session.studentId,
      },
    });

    if (existingSubmission) {
      // Update submission (version increment)
      await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileName,
          fileUrl,
          version: existingSubmission.version + 1,
          status: "SUBMITTED",
          marks: null,
          feedback: null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new submission
      await prisma.submission.create({
        data: {
          assignmentId,
          studentId: session.studentId,
          fileName,
          fileUrl,
          version: 1,
          status: "SUBMITTED",
        },
      });
    }

    // Create a notification for the mentor of this batch
    const batch = await prisma.batch.findUnique({
      where: { id: assignment.batchId },
      include: { mentor: true },
    });

    if (batch?.mentor) {
      await prisma.notification.create({
        data: {
          userId: batch.mentor.userId,
          title: "New Submission",
          message: `${session.name} uploaded a submission for: ${assignment.title}`,
          type: "ALERT",
        },
      });
    }

    revalidatePath("/student/assignments");
    revalidatePath("/mentor/reviews");
    
    return { success: true };
  } catch (error) {
    console.error("Assignment submission error:", error);
    return { success: false, error: "An error occurred during submission." };
  }
}

export async function gradeSubmissionAction(
  submissionId: string,
  marks: number,
  feedback: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MENTOR" || !session.mentorId) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!submissionId || marks === undefined || marks === null) {
      return { success: false, error: "Please provide a submission ID and marks." };
    }

    const marksNum = Number(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      return { success: false, error: "Marks must be between 0 and 100." };
    }

    // Update submission
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        marks: marksNum,
        feedback,
        status: "GRADED",
        updatedAt: new Date(),
      },
      include: {
        assignment: true,
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    // Notify the student
    await prisma.notification.create({
      data: {
        userId: submission.student.userId,
        title: "Assignment Graded",
        message: `Your submission for "${submission.assignment.title}" has been graded: ${marksNum}%`,
        type: "FEEDBACK",
      },
    });

    revalidatePath("/mentor/reviews");
    revalidatePath("/student/assignments");
    revalidatePath("/student/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to grade submission:", error);
    return { success: false, error: "An error occurred while saving the grade." };
  }
}
