
"use client";

import "../styles/daftar.css";
import { useState, type FormEvent } from "react";

type RegisterResult = {
  success?: boolean;
  message?: string;
};

const RegisterPage = () => {
  const [showNotif, setShowNotif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSuccess, setNotifSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(
      formData.get("confirm-password") ?? "",
    );

    if (password !== confirmPassword) {
      setNotifSuccess(false);
      setNotifTitle("Password Tidak Cocok");
      setNotifMessage(
        "Pastikan password dan konfirmasi password sama.",
      );
      setShowNotif(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          confirmPassword,
        }),
      });

      const result: RegisterResult = await response.json();

      if (!response.ok || !result.success) {
        setNotifSuccess(false);
        setNotifTitle("Pendaftaran Belum Berhasil");
        setNotifMessage(
          result.message ||
            "Terjadi kesalahan. Silakan coba lagi.",
        );
        setShowNotif(true);
        return;
      }

      setNotifSuccess(true);
      setNotifTitle("Pendaftaran Berhasil");
      setNotifMessage(
        result.message ||
          "Silakan periksa email kamu untuk mendapatkan tautan verifikasi.",
      );
      setShowNotif(true);
      form.reset();
    } catch {
      setNotifSuccess(false);
      setNotifTitle("Koneksi Bermasalah");
      setNotifMessage(
        "Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.",
      );
      setShowNotif(true);
    } finally {
      setLoading(false);
    }
  };

  const closeNotif = () => {
    setShowNotif(false);
  };

  return (
    <main className="daftar-page-container">
      {showNotif && (
        <div className="notif-overlay">
          <div
            className="notif-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-notif-title"
            aria-describedby="register-notif-message"
          >
            <div className="notif-icon" aria-hidden="true">
              {notifSuccess ? "💌" : "⚠️"}
            </div>

            <h3 id="register-notif-title">{notifTitle}</h3>

            <p id="register-notif-message">
              {notifMessage}
            </p>

            <button
              type="button"
              onClick={closeNotif}
              className="notif-btn"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <section className="daftar-card">
        <div className="daftar-header">
          <h1>Mulai Perjalananmu</h1>
          <p>Buat akun dan kenali dirimu lebih baik.</p>
        </div>

        <form className="daftar-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Masukkan alamat email kamu"
              autoComplete="email"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Buat username kamu"
              autoComplete="username"
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_]+"
              title="Gunakan huruf, angka, dan underscore saja."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Masukkan password (minimal 8 karakter)"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Masukkan ulang password kamu"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "MEMPROSES..." : "DAFTAR"}
          </button>
        </form>

        <div className="daftar-footer-inside">
          <p>
            Sudah punya akun?{" "}
            <a href="/login" className="link-login">
              Masuk di sini
            </a>
          </p>

          <p className="copyright-text">
            &copy; 2026 Mindglow
          </p>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
