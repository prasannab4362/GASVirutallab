import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import AdminOversightConsole from "@/components/admin-oversight-console";

export default async function AdminOversightPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all batches with all relations
  const batches = await prisma.batch.findMany({
    include: {
      program: { select: { title: true } },
      mentor: { include: { user: { select: { name: true, email: true } } } },
      students: { include: { user: { select: { name: true } } } },
      assignments: {
        include: {
          submissions: true
        }
      },
      studyMaterials: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Workspace Oversight</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Monitor all active batches, inspect mentor resources, and view cohort communication in real-time.
        </p>
      </div>

      <AdminOversightConsole batches={JSON.parse(JSON.stringify(batches))} currentUserId={session.userId!} />
    </div>
  );
}
