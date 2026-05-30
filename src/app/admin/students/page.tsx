import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import StudentsManager from "@/components/students-manager";

export default async function AdminStudentsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch students, batches, programs
  const students = await prisma.student.findMany({
    include: {
      user: true,
      batch: true,
      program: true
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const batches = await prisma.batch.findMany({
    where: { status: "ACTIVE" }
  });

  const programs = await prisma.program.findMany({
    where: { status: "ACTIVE" }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Fellows Console</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Add new fellows, manage cohort divisions, and release official verified corporate graduation certificates.
        </p>
      </div>

      <StudentsManager 
        students={JSON.parse(JSON.stringify(students))} 
        batches={batches} 
        programs={programs} 
      />
    </div>
  );
}
