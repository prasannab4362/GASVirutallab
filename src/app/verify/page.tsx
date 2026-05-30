import Link from "next/link";
import { ShieldCheck, AlertCircle, ArrowLeft, Calendar, Award, CheckCircle2, Bookmark } from "lucide-react";
import { verifyCertificateAction } from "@/lib/actions/certificate-actions";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  
  const result = id ? await verifyCertificateAction(id) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="h-16 bg-white border-b border-zinc-200/60 flex items-center justify-between px-6 sm:px-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            G
          </div>
          <span className="font-bold text-zinc-950 tracking-tight text-lg">GAS Virtual Lab</span>
        </Link>
        <Link 
          href="/" 
          className="text-xs font-semibold text-zinc-550 hover:text-zinc-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center">
        {!id ? (
          <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-zinc-950">Verification Portal</h1>
            <p className="text-sm text-zinc-500">
              Please enter a certificate verification number on the home page or follow a direct verification link to verify a graduate's credentials.
            </p>
            <Link 
              href="/#verification"
              className="block w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all text-center shadow-md shadow-blue-500/10"
            >
              Go to Verification Search
            </Link>
          </div>
        ) : (result && result.success && result.certificate) ? (
          <div className="w-full space-y-8">
            {/* Success Card */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden grid md:grid-cols-5">
              
              {/* Sidebar decorative preview */}
              <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                
                <div className="space-y-4 relative">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-455 font-bold border border-white/10">
                    G
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight text-sm text-blue-400">GAS CREDENTIALS</h3>
                    <p className="text-[10px] text-zinc-400">Secured via Web Cryptography</p>
                  </div>
                </div>

                <div className="space-y-6 relative mt-12 md:mt-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                    Verified Valid
                  </div>
                  
                  <div className="font-mono text-[10px] text-zinc-400 tracking-wider">
                    ID: {result.certificate.certificateNumber}
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="md:col-span-3 p-8 sm:p-10 space-y-8">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                    Academic Registry Receipt
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-4 leading-tight">
                    {result.certificate.studentName}
                  </h1>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">
                    Student Matriculation: {result.certificate.matricNumber}
                  </p>
                </div>

                <div className="border-t border-zinc-100 pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Program Name</span>
                      <span className="text-sm font-semibold text-zinc-900">{result.certificate.programTitle}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Bookmark className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Cohort/Batch</span>
                        <span className="text-sm font-semibold text-zinc-900">{result.certificate.batchCode}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Graduation Date</span>
                        <span className="text-sm font-semibold text-zinc-900">
                          {new Date(result.certificate.issueDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/65 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-600 leading-relaxed">
                    This certificate is an official graduation document issued by the **GAS Virtual AI Lab** board. The digital credentials have been authenticated against our database.
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-zinc-950">Verification Failed</h1>
            <p className="text-sm text-zinc-500">
              {result?.error || `The certificate code "${id}" could not be verified. It may be invalid or revoked.`}
            </p>
            <Link 
              href="/#verification"
              className="block w-full py-3 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-all text-center"
            >
              Try Another Code
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 bg-zinc-950 text-zinc-500 border-t border-zinc-800 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} GAS Virtual AI Lab. All rights reserved.</p>
      </footer>
    </div>
  );
}
