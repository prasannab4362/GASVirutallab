"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Download, ShieldCheck, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface CertificateViewerProps {
  certificate: {
    certificateNumber: string;
    studentName: string;
    programTitle: string;
    issueDate: string | Date;
    verificationUrl: string;
  };
}

export default function CertificateViewer({ certificate }: CertificateViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Generate QR Code URL
    const generateQrCode = async () => {
      try {
        const url = await QRCode.toDataURL(certificate.verificationUrl, {
          margin: 1,
          width: 100,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    };
    generateQrCode();
  }, [certificate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 800, 560);

    // 1. Draw Background (Off-white / Premium parchment look)
    ctx.fillStyle = "#fafaff";
    ctx.fillRect(0, 0, 800, 560);

    // 2. Draw Elegant Border
    // Outer Border
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#002855"; // Deep navy blue
    ctx.strokeRect(15, 15, 770, 530);

    // Inner Accent Border (Gold)
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#c5a059"; // Warm Gold
    ctx.strokeRect(30, 30, 740, 500);

    // Corner Ornaments (Gold lines)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#c5a059";
    // Top Left
    ctx.beginPath();
    ctx.moveTo(35, 45); ctx.lineTo(65, 45); ctx.moveTo(45, 35); ctx.lineTo(45, 65);
    ctx.stroke();
    // Top Right
    ctx.beginPath();
    ctx.moveTo(765, 45); ctx.lineTo(735, 45); ctx.moveTo(755, 35); ctx.lineTo(755, 65);
    ctx.stroke();
    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(35, 515); ctx.lineTo(65, 515); ctx.moveTo(45, 525); ctx.lineTo(45, 495);
    ctx.stroke();
    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(765, 515); ctx.lineTo(735, 515); ctx.moveTo(755, 525); ctx.lineTo(755, 495);
    ctx.stroke();

    // 3. Draw Brand Watermark Logo at Center (Transparent text/shape)
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = "#002855";
    ctx.font = "italic bold 180px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAS", 400, 280);
    ctx.restore();

    // 4. Draw Headers
    ctx.fillStyle = "#002855";
    ctx.textAlign = "center";
    
    // Main Title
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.fillText("GAS VIRTUAL AI LAB", 400, 85);
    
    // Sub-title
    ctx.fillStyle = "#c5a059";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillText("CERTIFICATE OF FELLOWSHIP COMPLETION", 400, 115);

    // 5. Draw Certificate Body Text
    ctx.fillStyle = "#4a4a4a";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("This official corporate credential verifies that", 400, 185);

    // Student Name
    ctx.fillStyle = "#002855";
    ctx.font = "bold 34px Georgia, serif";
    ctx.fillText(certificate.studentName, 400, 240);

    // Middle text
    ctx.fillStyle = "#4a4a4a";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("has successfully completed all milestones and weekly sync reviews in the", 400, 290);

    // Program Title
    ctx.fillStyle = "#c5a059";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.fillText(certificate.programTitle, 400, 330);

    // 6. Draw Signatures lines
    ctx.strokeStyle = "#c5a059";
    ctx.lineWidth = 1;
    
    // Left signature line (Director)
    ctx.beginPath();
    ctx.moveTo(150, 440);
    ctx.lineTo(300, 440);
    ctx.stroke();

    // Right signature line (Lead Mentor)
    ctx.beginPath();
    ctx.moveTo(500, 440);
    ctx.lineTo(650, 440);
    ctx.stroke();

    // Signature labels
    ctx.fillStyle = "#555";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("DIRECTOR OF ACADEMICS", 225, 455);
    ctx.fillText("LEAD FELLOWSHIP MENTOR", 575, 455);

    // Draw Mock signatures
    ctx.fillStyle = "#002855";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText("Prasanna B.", 225, 425);
    ctx.fillText("AI Lead Team", 575, 425);

    // 7. Draw Verification details & QR Code
    // Issue Date
    ctx.fillStyle = "#888";
    ctx.font = "10px Inter, sans-serif";
    const dateStr = new Date(certificate.issueDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    ctx.fillText(`Issue Date: ${dateStr}`, 400, 380);

    // ID Badge
    ctx.fillStyle = "#002855";
    ctx.font = "bold 9px monospace";
    ctx.fillText(`CERTIFICATE CODE: ${certificate.certificateNumber}`, 400, 490);

    // Draw QR Code on the canvas if available
    if (qrCodeUrl) {
      const qrImage = new Image();
      qrImage.onload = () => {
        // Draw image in the bottom center area
        ctx.drawImage(qrImage, 365, 405, 70, 70);
      };
      qrImage.src = qrCodeUrl;
    }

  }, [certificate, qrCodeUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    try {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 560],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 800, 560);
      pdf.save(`GAS-Certificate-${certificate.certificateNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      
      {/* Canvas wrapper with overflow scroll on mobile */}
      <div className="w-full max-w-4xl overflow-x-auto p-4 bg-zinc-100 dark:bg-zinc-800/40 rounded-3xl border border-zinc-250/50 flex justify-center">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={560}
          className="shadow-2xl rounded-xl shrink-0 bg-white"
          style={{ width: "800px", height: "560px" }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-md justify-center">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF Certificate</span>
            </>
          )}
        </button>

        <a
          href={certificate.verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-2xl text-zinc-700 dark:text-zinc-250 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Verify Credential Link</span>
        </a>
      </div>

    </div>
  );
}
