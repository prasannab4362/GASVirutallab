"use server";

import nodemailer from "nodemailer";

export async function sendContactEmailAction(name: string, email: string, message: string) {
  try {
    if (!name || !email || !message) {
      return { success: false, error: "Please fill out all fields." };
    }

    const gmailUser = process.env.GMAIL_USER || "";
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || "";

    if (!gmailUser || !gmailAppPassword) {
      console.warn("Gmail SMTP credentials are not configured. Check your env variables (GMAIL_USER, GMAIL_APP_PASSWORD).");
      return { 
        success: false, 
        error: "Email credentials are not configured on the server. Please define GMAIL_USER and GMAIL_APP_PASSWORD." 
      };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const mailOptions = {
      from: `"${name}" <${gmailUser}>`, // Must match authenticated address on Gmail SMTP
      to: gmailUser, // Deliver directly to the user's inbox
      replyTo: email, // Reply-to details of the person filling the form
      subject: `[GAS Virtual Lab] Admissions Enquiry from ${name}`,
      text: `Admissions Inquiry:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="color: #10b981; border-bottom: 1px solid #e4e4e7; padding-bottom: 10px; margin-top: 0;">New Admissions Inquiry</h2>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #10b981; border-radius: 4px; font-style: italic; color: #374151;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p style="font-size: 11px; color: #71717a; text-align: center; margin: 0;">
            This email was sent dynamically from the Green Automation Solution Virtual Lab Contact Form.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send contact email:", error);
    return { success: false, error: `Email transmission failed: ${error.message || error}` };
  }
}
