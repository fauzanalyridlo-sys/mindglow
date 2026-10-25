"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VerificationState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasVerified = useRef(false);

  const [state, setState] = useState<VerificationState>(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Sedang memverifikasi alamat email kamu."
      : "Tautan verifikasi tidak lengkap. Silakan gunakan tautan dari email verifikasi kamu.",
  );

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          cache: "no-store",
        });

        const result: {
          success?: boolean;
          message?: string;
        } = await response.json();

        if (!response.ok || !result.success) {
          setState("error");
          setMessage(
            result.message ||
              "Verifikasi email gagal. Silakan coba lagi.",
          );
          return;
        }

        setState("success");
        setMessage(
          result.message ||
            "Email berhasil diverifikasi. Kamu sekarang bisa login.",
        );
      } catch {
        setState("error");
        setMessage(
          "Tidak dapat menghubungi server. Periksa koneksi internet dan coba lagi.",
        );
      }
    };

    void verifyEmail();
  }, [token]);

  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <section
        className="w-full max-w-md rounded-2xl border border-pink-100 bg-white p-8 text-center shadow-lg"
        aria-live="polite"
      >
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
            isLoading
              ? "bg-blue-50"
              : isSuccess
                ? "bg-green-50"
                : "bg-red-50"
          }`}
          aria-hidden="true"
        >
          {isLoading ? "⏳" : isSuccess ? "💗" : "✉️"}
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-800">
          {isLoading
            ? "Memverifikasi Email"
            : isSuccess
              ? "Email Terverifikasi!"
              : "Verifikasi Belum Berhasil"}
        </h1>

        <p className="mb-7 text-sm leading-6 text-gray-600">
          {message}
        </p>

        {!isLoading && (
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-pink-500 px-5 py-3 font-semibold text-white transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            {isSuccess ? "Masuk ke MindGlow" : "Kembali ke Login"}
          </Link>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
          <p className="text-sm text-gray-600" role="status">
            Memuat halaman verifikasi email...
          </p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
