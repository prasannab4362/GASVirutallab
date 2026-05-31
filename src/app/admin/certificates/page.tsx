import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Award } from "lucide-react";
import Link from "next/link";

export default async function AdminCertificatesPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const certificates = await prisma.certificate.findMany({
    include: {
      student: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      program: {
        select: {
          title: true
        }
      }
    },
    orderBy: { issueDate: "desc" }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Credentials Registry</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Review all blockchain-verifiable graduation credentials released to fellowship interns.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <Award className="w-12 h-12 text-zinc-355 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Released Certificates</h3>
          <p className="text-zinc-505 text-xs sm:text-sm mt-1 max-w-sm">
            Graduation credentials can be generated and released directly from the interns registration console.
          </p>
          <Link 
            href="/admin/students" 
            className="mt-6 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            Go to Interns Console
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/50 dark:bg-zinc-800/20">
                  <th className="py-4 px-6">Certificate ID</th>
                  <th className="py-4 px-4">Intern</th>
                  <th className="py-4 px-4">Enrolled Program</th>
                  <th className="py-4 px-4">Date Released</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-55 dark:divide-zinc-850 text-xs">
                {certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                    <td className="py-4 px-6 font-mono font-bold text-blue-650 dark:text-blue-400">
                      {c.certificateNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-white">
                      {c.student.user.name}
                    </td>
                    <td className="py-4 px-4 text-zinc-550 max-w-[200px] truncate">
                      {c.program.title}
                    </td>
                    <td className="py-4 px-4 text-zinc-500">
                      {new Date(c.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/verify?id=${c.certificateNumber}`}
                        className="text-blue-655 hover:text-blue-700 font-semibold transition-colors"
                      >
                        Inspect Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
