"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProjectAction(
  title: string,
  description: string,
  deadlineInput: string,
  mentorId: string,
  studentIdInput?: string
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized access." };
    }

    let studentId = "";
    if (session.role === "STUDENT") {
      if (!session.studentId) {
        return { success: false, error: "Student profile not found." };
      }
      studentId = session.studentId;
    } else if (session.role === "ADMIN" || session.role === "MENTOR") {
      if (!studentIdInput) {
        return { success: false, error: "Please specify a target student." };
      }
      studentId = studentIdInput;
    } else {
      return { success: false, error: "Unauthorized role access." };
    }

    if (!title || !description || !deadlineInput || !mentorId) {
      return { success: false, error: "Please fill out all required fields." };
    }

    const deadline = new Date(deadlineInput);
    if (isNaN(deadline.getTime())) {
      return { success: false, error: "Please enter a valid deadline date." };
    }

    // Create project
    await prisma.project.create({
      data: {
        title,
        description,
        mentorId,
        studentId,
        deadline,
        status: "ASSIGNED",
        progressPercentage: 0,
      },
    });

    // Find mentor userId
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId }
    });

    if (mentor) {
      // Notify the mentor
      await prisma.notification.create({
        data: {
          userId: mentor.userId,
          title: "New Project Assigned",
          message: `Project "${title}" has been created and assigned to you.`,
          type: "ALERT",
        },
      });
    }

    revalidatePath("/student/projects");
    revalidatePath("/mentor/students");
    return { success: true };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "An error occurred while creating project." };
  }
}

export async function updateProjectProgressAction(
  projectId: string,
  progressPercentage: number,
  status: "ASSIGNED" | "IN_PROGRESS" | "REVIEW" | "APPROVED" | "COMPLETED"
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!projectId || progressPercentage === undefined || !status) {
      return { success: false, error: "Missing project modification details." };
    }

    const progress = Number(progressPercentage);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return { success: false, error: "Progress must be between 0 and 100." };
    }

    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        progressPercentage: progress,
        status,
      },
      include: {
        student: true,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: project.student.userId,
        title: "Project Progress Updated",
        message: `Project "${project.title}" status shifted to: ${status.replace("_", " ")} (${progress}%)`,
        type: "ALERT",
      },
    });

    revalidatePath("/student/projects");
    revalidatePath("/mentor/students");
    return { success: true };
  } catch (error) {
    console.error("Failed to update project progress:", error);
    return { success: false, error: "An error occurred while updating project." };
  }
}

export async function createProjectTaskAction(projectId: string, title: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };

    if (!projectId || !title) return { success: false, error: "All fields are required." };

    await prisma.projectTask.create({
      data: {
        projectId,
        title,
        status: "TODO",
      },
    });

    revalidatePath("/student/projects");
    revalidatePath("/mentor/students");
    return { success: true };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task." };
  }
}

export async function updateProjectTaskStatusAction(taskId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED") {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };

    if (!taskId || !status) return { success: false, error: "All fields are required." };

    await prisma.projectTask.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath("/student/projects");
    revalidatePath("/mentor/students");
    return { success: true };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { success: false, error: "Failed to update task." };
  }
}

export async function deleteProjectTaskAction(taskId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };

    await prisma.projectTask.delete({
      where: { id: taskId },
    });

    revalidatePath("/student/projects");
    revalidatePath("/mentor/students");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task." };
  }
}
