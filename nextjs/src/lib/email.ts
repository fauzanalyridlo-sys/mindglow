import "server-only";

import { Resend } from "resend";

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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error(
      "Konfigurasi pengiriman email belum tersedia."
    );
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
  });

  if (error) {
    console.error("Resend gagal mengirim email:", error.name, error.message);

    throw new Error("Gagal mengirim email.");
  }

  return data;
}
