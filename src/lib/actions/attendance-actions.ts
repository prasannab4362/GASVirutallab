"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitDailyCheckinAction(eodText: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT" || !session.studentId) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!eodText || eodText.trim().length === 0) {
      return { success: false, error: "EOD text update cannot be empty." };
    }

    const studentId = session.studentId;

    // Normalize date to 00:00:00 today to match uniqueness constraint
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Upsert attendance record for today (PRESENT, 100% score as per automated rule)
    await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: todayDate,
        },
      },
      update: {
        score: 100,
        status: "PRESENT",
        details: eodText.trim(),
      },
      create: {
        studentId,
        date: todayDate,
        score: 100,
        status: "PRESENT",
        details: eodText.trim(),
      },
    });

    // Retrieve student info to locate mentors to notify
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true } },
        batch: {
          select: {
            mentor: { select: { userId: true } },
          },
        },
        projects: {
          select: {
            mentor: { select: { userId: true } },
          },
        },
      },
    });

    if (student) {
      // Find all unique mentor user IDs
      const mentorUserIds = new Set<string>();

      if (student.batch?.mentor?.userId) {
        mentorUserIds.add(student.batch.mentor.userId);
      }

      if (student.projects && student.projects.length > 0) {
        student.projects.forEach((proj) => {
          if (proj.mentor?.userId) {
            mentorUserIds.add(proj.mentor.userId);
          }
        });
      }

      // Send notifications to each mentor
      for (const mentorUserId of mentorUserIds) {
        await prisma.notification.create({
          data: {
            userId: mentorUserId,
            title: "Fellow EOD Update",
            message: `${student.user.name} submitted standup EOD: "${eodText.trim()}"`,
            type: "ALERT",
          },
        });
      }
    }

    // Revalidate paths to refresh components
    revalidatePath("/student/dashboard");
    revalidatePath("/student/attendance");
    revalidatePath("/admin/attendance");
    revalidatePath("/mentor/students");

    return { success: true };
  } catch (error) {
    console.error("Daily check-in failure:", error);
    return { success: false, error: "An error occurred while submitting check-in." };
  }
}

export async function approveAttendanceAction(attendanceId: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "MENTOR" && session.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized access. Only mentors or admins can approve EOD logs." };
    }

    if (!attendanceId) {
      return { success: false, error: "Missing attendance record identifier." };
    }

    const attendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: "PRESENT",
        score: 100,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // Notify the student that their EOD standup check-in was approved
    await prisma.notification.create({
      data: {
        userId: attendance.student.userId,
        title: "Daily Standup Approved",
        message: `Your EOD check-in for ${new Date(attendance.date).toLocaleDateString()} has been approved (100% PRESENT).`,
        type: "FEEDBACK",
      },
    });

    // Revalidate paths to refresh components
    revalidatePath("/student/dashboard");
    revalidatePath("/student/attendance");
    revalidatePath("/admin/attendance");
    revalidatePath("/mentor/students");

    return { success: true };
  } catch (error) {
    console.error("Failed to approve attendance check-in:", error);
    return { success: false, error: "An error occurred while approving check-in." };
  }
}
