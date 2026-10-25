"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/profile.css";

type ProfileData = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: ProfileData;
};

const ProfilePage = () => {
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        const result: ApiResponse = await response.json();

        if (cancelled) return;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Gagal mengambil data profil.");
        }

        setProfileData({
          username: result.data.username ?? "",
          email: result.data.email,
          phone: result.data.phone ?? "",
        });

        setDisplayName(result.data.name);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil profil.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    setMessage("");
    setError("");

    const username = profileData.username.trim();
    const email = profileData.email.trim();
    const phone = profileData.phone.trim();

    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      setError(
        "Username harus 3–50 karakter dan hanya boleh berisi huruf, angka, atau underscore.",
      );
      return;
    }

    if (!email || email.length > 255) {
      setError("Masukkan email yang valid.");
      return;
    }

    if (phone.length > 30) {
      setError("Nomor telepon maksimal 30 karakter.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          username,
          email,
          phone,
        }),
      });

      const result: ApiResponse = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Gagal memperbarui profil.");
      }

      setProfileData({
        username: result.data.username ?? "",
        email: result.data.email,
        phone: result.data.phone ?? "",
      });

      setDisplayName(result.data.name);
      setMessage(result.message || "Profil berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan profil.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setMessage("");
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Logout gagal.");
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat logout.",
      );
      setLoggingOut(false);
    }
  };

  const busy = loading || saving || loggingOut;

  return (
    <div className="profile-page-container">
      <div className="profile-hero"></div>

      <div className="profile-content-wrapper">
        <div className="profile-card">
          <div className="profile-avatar">
            {(profileData.username || displayName || "?")
              .charAt(0)
              .toUpperCase()}
          </div>

          <h2 className="profile-name-title">
            {loading ? "Memuat..." : profileData.username || displayName}
          </h2>

          <p className="profile-subtitle">
            Kelola informasi data dirimu di sini
          </p>

          {error && (
            <p role="alert" style={{ color: "#dc2626", fontSize: 12 }}>
              {error}
            </p>
          )}

          {message && (
            <p role="status" style={{ color: "#15803d", fontSize: 12 }}>
              {message}
            </p>
          )}

          <div className="profile-form">
            <div className="profile-form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                disabled={busy}
                maxLength={50}
                autoComplete="username"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                disabled={busy}
                maxLength={255}
                autoComplete="email"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={busy}
                maxLength={30}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="profile-buttons-wrapper">
            <button
              type="button"
              className="btn-profile-update"
              onClick={handleUpdate}
              disabled={busy || Boolean(error && loading)}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              className="btn-profile-logout"
              onClick={handleLogout}
              disabled={busy}
            >
              {loggingOut ? "Keluar..." : "Keluar Akun"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
