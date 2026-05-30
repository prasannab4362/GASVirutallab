"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markNotificationAsReadAction(notificationId: string, pathToRevalidate?: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    
    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to update notification." };
  }
}
