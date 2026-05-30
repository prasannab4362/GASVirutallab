import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import CertificateViewer from "@/components/certificate-viewer";
import { Award, AlertCircle, Bookmark, CheckSquare, Target } from "lucide-react";

export default async function StudentCertificatesPage() {
  const session = await getSession();
  
  if (!session || session.role !== "STUDENT" || !session.studentId) {
    redirect("/login");
  }

  // Fetch student certificates
  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      certificates: {
        include: {
          program: true
        }
      },
      projects: true,
      submissions: {
        where: { status: "GRADED" }
      }
    }
  });

  if (!student) {
    redirect("/login");
  }

  const certificate = student.certificates[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Graduation Credentials</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Access your digital blockchain-verifiable completion certificate once fellowship milestones are verified by mentors.
        </p>
      </div>

      {certificate ? (
        <CertificateViewer 
          certificate={{
            certificateNumber: certificate.certificateNumber,
            studentName: session.name,
            programTitle: certificate.program.title,
            issueDate: certificate.issueDate,
            verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify?id=${certificate.certificateNumber}`
          }}
        />
      ) : (
        <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-8 shadow-sm space-y-8">
          <div className="text-center max-w-md mx-auto space-y-3 py-6">
            <Award className="w-12 h-12 text-zinc-350 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">Certificate Locked</h3>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
              Your graduation credentials will unlock automatically once your fellowship program ends and all project milestones are graded.
            </p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-6">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-650" />
              Graduation Checklist Progress
            </h4>

            <div className="grid sm:grid-cols-2 gap-4 text-xs font-medium text-zinc-700 dark:text-zinc-350">
              <div className="flex items-center gap-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Assignments Uploaded: {student.submissions.length} logs</span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span>Milestone Projects: {student.projects.length} assigned</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/20 rounded-2xl flex gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-zinc-900 dark:text-zinc-300">Milestone Audit Pending</span>
              <span className="mt-0.5 block leading-relaxed">
                If all assignments and project milestones have been submitted, please reach out to your lead cohort mentor to trigger your graduation credentials generation.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
