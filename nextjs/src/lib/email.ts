import "server-only";
import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({
  to,
  subject,
  text,
}: SendEmailOptions) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const missingConfig = [
    !host && "SMTP_HOST",
    !process.env.SMTP_PORT && "SMTP_PORT (kosong; default 465 digunakan)",
    !user && "SMTP_USER",
    !pass && "SMTP_PASS",
    !Number.isInteger(port) && "SMTP_PORT (bukan bilangan bulat)",
    (port < 1 || port > 65535) && "SMTP_PORT (di luar rentang valid)",
  ].filter(Boolean);

  if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Konfigurasi SMTP bermasalah:", missingConfig);
    throw new Error("Konfigurasi SMTP belum lengkap.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    return await transporter.sendMail({
      from: {
        name: "MindGlow",
        address: user,
      },
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error(
      "Pengiriman email SMTP gagal:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw new Error("Gagal mengirim email.");
  }
}
