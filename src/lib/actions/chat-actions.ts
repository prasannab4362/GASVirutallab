"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendChatMessageAction(batchId: string, content: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!batchId || !content.trim()) {
      return { success: false, error: "Empty message." };
    }

    // Verify user is part of the batch
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { students: true }
    });

    if (!batch) return { success: false, error: "Batch not found." };

    let isAuthorized = false;
    if (session.role === "ADMIN") {
      isAuthorized = true;
    } else if (session.role === "MENTOR" && batch.mentorId === session.mentorId) {
      isAuthorized = true;
    } else if (session.role === "STUDENT" && batch.students.some(s => s.userId === session.userId)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return { success: false, error: "You are not authorized to post in this batch." };
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        batchId,
        senderId: session.userId,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    // If Mentor sends a message, notify all students
    if (session.role === "MENTOR") {
      for (const student of batch.students) {
        await prisma.notification.create({
          data: {
            userId: student.userId,
            title: "New Chat from Mentor",
            message: `Your mentor posted a new message in batch ${batch.batchCode}.`,
            type: "PLATFORM",
          },
        });
      }
    }
    // If Student sends a message, notify the Mentor
    else if (session.role === "STUDENT" && batch.mentorId) {
      const mentor = await prisma.mentor.findUnique({ where: { id: batch.mentorId }});
      if (mentor) {
        await prisma.notification.create({
          data: {
            userId: mentor.userId,
            title: "New Chat from Intern",
            message: `${session.name} posted a new message in batch ${batch.batchCode}.`,
            type: "PLATFORM",
          },
        });
      }
    }

    // Note: We won't revalidate full paths heavily to prevent UI flicker for polling.
    // Client side polling will pick it up via API.
    return { success: true, message };
  } catch (error) {
    console.error("Send message error:", error);
    return { success: false, error: "An error occurred while sending." };
  }
}

export async function getChatMessagesAction(batchId: string, limit = 50) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, messages: [] };

    // In a real robust system, we check auth again, but this is a read query.
    const messages = await prisma.chatMessage.findMany({
      where: { batchId },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Reverse them to chronological order (oldest first at top, newest at bottom)
    return { success: true, messages: messages.reverse() };
  } catch (error) {
    console.error("Fetch messages error:", error);
    return { success: false, messages: [] };
  }
}
