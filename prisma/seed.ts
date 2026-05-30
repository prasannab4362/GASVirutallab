import { Role, ProjectStatus, SubmissionStatus, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/db";

async function main() {
  console.log("Cleaning up existing database records...");
  
  // Delete in dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.mentor.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Generating password hashes...");
  const adminHash = await bcrypt.hash("admin123", 10);
  const mentorHash = await bcrypt.hash("mentor123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  console.log("Creating users...");
  
  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@gas.ai",
      passwordHash: adminHash,
      role: Role.ADMIN,
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const mentorUser = await prisma.user.create({
    data: {
      name: "Dr. Sarah Jenkins",
      email: "mentor@gas.ai",
      passwordHash: mentorHash,
      role: Role.MENTOR,
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      name: "Alex R.",
      email: "student@gas.ai",
      passwordHash: studentHash,
      role: Role.STUDENT,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("Creating programs and batches...");
  
  // 2. Create Program
  const program = await prisma.program.create({
    data: {
      title: "Advanced AI and Deep Learning Fellowship",
      description: "An intensive cohort-based training program covering neural network design, computer vision, generative AI, LLMs, and RAG systems.",
      duration: "6 Months",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-06-30"),
      status: "ACTIVE",
    },
  });

  // 3. Create Mentor profile
  const mentor = await prisma.mentor.create({
    data: {
      userId: mentorUser.id,
    },
  });

  // 4. Create Batch
  const batch = await prisma.batch.create({
    data: {
      batchCode: "AI-2026-B1",
      programId: program.id,
      mentorId: mentor.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-06-30"),
      status: "ACTIVE",
    },
  });

  // 5. Create Student profile
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      matricNumber: "GAS-2026-0089",
      programId: program.id,
      batchId: batch.id,
    },
  });

  console.log("Creating projects...");
  
  // 6. Create Projects
  const project1 = await prisma.project.create({
    data: {
      title: "Neural Net Architecture Implementation",
      description: "Implement a custom convolutional network and dynamic ResNet blocks from scratch using PyTorch. Evaluate model complexity, latency, and performance on the CIFAR-100 dataset.",
      studentId: student.id,
      mentorId: mentor.id,
      progressPercentage: 75,
      status: ProjectStatus.IN_PROGRESS,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "NLP Chatbot with RAG Integration",
      description: "Construct a robust Retrieval-Augmented Generation pipeline using LangChain, FAISS, and OpenAI APIs. Must support document ingestion, hybrid search, and citation links.",
      studentId: student.id,
      mentorId: mentor.id,
      progressPercentage: 100,
      status: ProjectStatus.REVIEW,
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  console.log("Creating assignments and submissions...");
  
  // 7. Create Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: "Deep Learning Foundations Quiz",
      description: "Complete the quiz on backpropagation, activation functions, loss curves, and optimizer mechanics.",
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      batchId: batch.id,
      status: "ACTIVE",
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: "Neural Network Layout Design",
      description: "Submit a comprehensive architecture layout diagram and written design doc justifying your choices for a high-throughput video processing model.",
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      batchId: batch.id,
      status: "ACTIVE",
    },
  });

  // 8. Create Submissions
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student.id,
      fileName: "dl_quiz_submission.pdf",
      fileUrl: "/uploads/dl_quiz_submission.pdf",
      status: SubmissionStatus.GRADED,
      marks: 92,
      feedback: "Excellent layout representation and backpropagation derivative breakdown. Outstanding work!",
      version: 1,
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: assignment2.id,
      studentId: student.id,
      fileName: "nn_layout_design_v1.zip",
      fileUrl: "/uploads/nn_layout_design_v1.zip",
      status: SubmissionStatus.SUBMITTED,
      version: 1,
    },
  });

  console.log("Creating attendance records...");
  
  // 9. Create Attendance records for past 5 days
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Give varying scores to show attendance engine levels (80+ present, 50-79 partial, <50 inactive)
    let score = 90; // Default Present
    if (i === 1) score = 65; // Partial
    if (i === 3) score = 30; // Inactive
    if (i === 4) score = 95; // Present

    const status = score >= 80 ? AttendanceStatus.PRESENT : score >= 50 ? AttendanceStatus.PARTIAL : AttendanceStatus.INACTIVE;

    await prisma.attendance.create({
      data: {
        studentId: student.id,
        date,
        score,
        status,
        details: `Simulated activity scores: Login=100%, SubmissionActivity=${score > 70 ? 100 : 0}%, SessionAttendance=${score > 50 ? 100 : 0}%`,
      },
    });
  }

  console.log("Creating meetings...");
  
  // 10. Create Meetings
  const meetingToday = new Date();
  meetingToday.setHours(14, 0, 0, 0); // 2:00 PM today

  await prisma.meeting.create({
    data: {
      title: "Batch Weekly Progress Sync & NLP Q&A",
      description: "Review progress on active projects, discuss blockers on assignment submissions, and run an interactive Q&A session on RAG models.",
      batchId: batch.id,
      mentorId: mentor.id,
      date: meetingToday,
      duration: 60,
      joinUrl: "https://zoom.us/j/9876543210",
      notes: "Topics: Convolutional kernels, multi-head attention weights, LangChain memory modules.",
      status: "SCHEDULED",
    },
  });

  const meetingPast = new Date();
  meetingPast.setDate(today.getDate() - 3);
  meetingPast.setHours(11, 0, 0, 0); // 11:00 AM 3 days ago

  await prisma.meeting.create({
    data: {
      title: "Deep Learning Foundations Kickoff",
      description: "Introduction to program expectations, learning path overview, and environment setups.",
      batchId: batch.id,
      mentorId: mentor.id,
      date: meetingPast,
      duration: 90,
      joinUrl: "https://zoom.us/j/9876543210",
      notes: "Intro session concluded. Slides shared on general announcements channel.",
      status: "COMPLETED",
    },
  });

  console.log("Creating certificate...");
  
  // 11. Create Certificate (Pre-issued sample for verification checks)
  await prisma.certificate.create({
    data: {
      studentId: student.id,
      programId: program.id,
      certificateNumber: "GAS-2026-ALEX",
      verificationUrl: "/verify?id=GAS-2026-ALEX",
      qrCodeData: "GAS-2026-ALEX",
      issueDate: new Date("2026-05-15"),
      status: "VALID",
    },
  });

  console.log("Creating notifications...");
  
  // 12. Create Notifications
  const notifications = [
    {
      userId: studentUser.id,
      title: "Welcome to GAS Virtual AI Lab!",
      message: "Get started by accessing your learning path modules and reviewing assigned projects.",
      type: "PLATFORM",
      isRead: true,
    },
    {
      userId: studentUser.id,
      title: "New Assignment Posted",
      message: "Dr. Sarah Jenkins posted a new assignment: Neural Network Layout Design due in 2 days.",
      type: "ALERT",
      isRead: false,
    },
    {
      userId: studentUser.id,
      title: "Project Review Feedback Received",
      message: "Submission for dl_quiz_submission.pdf has been graded by Dr. Sarah Jenkins (Score: 92/100).",
      type: "FEEDBACK",
      isRead: false,
    },
    {
      userId: mentorUser.id,
      title: "Submission Awaiting Review",
      message: "Alex R. submitted a layout design document for assignment: Neural Network Layout Design.",
      type: "ALERT",
      isRead: false,
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: n,
    });
  }

  console.log("Creating audit logs...");
  
  // 13. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "CREATE_PROGRAM",
      details: "Created program: Advanced AI and Deep Learning Fellowship",
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "ISSUE_CERTIFICATE",
      details: "Issued certificate GAS-2026-ALEX to student Alex R.",
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: studentUser.id,
      action: "LOGIN",
      details: "Student logged in successfully from Chrome/Win11",
    },
  });

  console.log("Seeding complete! Admin: admin@gas.ai / Mentor: mentor@gas.ai / Student: student@gas.ai (All password: '123')");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
