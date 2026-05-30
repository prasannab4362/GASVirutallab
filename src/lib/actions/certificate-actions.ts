"use server";

import prisma from "@/lib/db";

export async function verifyCertificateAction(certNumber: string) {
  try {
    if (!certNumber) {
      return { success: false, error: "Please enter a certificate number." };
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber: certNumber.trim() },
      include: {
        student: {
          include: {
            user: true,
            batch: true,
          },
        },
        program: true,
      },
    });

    if (!certificate) {
      return { success: false, error: "Certificate number not found in our database." };
    }

    return {
      success: true,
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.student.user.name,
        matricNumber: certificate.student.matricNumber || "N/A",
        programTitle: certificate.program.title,
        batchCode: certificate.student.batch?.batchCode || "N/A",
        issueDate: certificate.issueDate,
        status: certificate.status,
      },
    };
  } catch (error) {
    console.error("Certificate verification error:", error);
    return { success: false, error: "An error occurred during verification. Please try again." };
  }
}
