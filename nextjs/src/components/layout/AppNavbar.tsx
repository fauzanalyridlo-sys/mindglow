"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../ui/Logo";
import UserAvatar from "../ui/UserAvatar";
import "../../styles/app-navbar.css";

type AppNavbarProps = {
  userName?: string;
};

type ProfileResponse = {
  success: boolean;
  data?: {
    name: string;
    username: string | null;
  };
};

const navigation = [
  { label: "Beranda", path: "/dashboard" },
  { label: "Cek Harian", path: "/checkin" },
  { label: "Jurnal", path: "/journal" },
  { label: "Akademik", path: "/akademik" },
  { label: "Wawasan", path: "/wawasan" },
  { label: "Refleksi AI", path: "/ai" },
];

export default function AppNavbar({
  userName = "",
}: AppNavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState(userName);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) return;

        const result: ProfileResponse = await response.json();

        if (!cancelled && result.success && result.data) {
          setCurrentUserName(
            result.data.username?.trim() || result.data.name || ""
          );
        }
      } catch {
        // Pertahankan nama terakhir jika permintaan gagal.
      }
    };

    void fetchProfile();

    window.addEventListener("mindglow:profile-updated", fetchProfile);

    return () => {
      cancelled = true;
      window.removeEventListener(
        "mindglow:profile-updated",
        fetchProfile
      );
    };
  }, [pathname]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="app-navbar">
      <div className="app-navbar-container">
        <Logo />

        <nav
          id="app-navbar-navigation"
          className={`app-navbar-links ${
            isMenuOpen ? "app-navbar-links--open" : ""
          }`}
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={closeMenu}
              aria-current={
                pathname?.toLowerCase() === item.path.toLowerCase()
                  ? "page"
                  : undefined
              }
              className={`app-navbar-link ${
                pathname?.toLowerCase() === item.path.toLowerCase()
                  ? "active"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="app-navbar-actions">
          <Link
            href="/profile"
            className="app-navbar-profile"
            aria-label="Buka profil pengguna"
            title="Profil pengguna"
            onClick={closeMenu}
          >
            <UserAvatar name={currentUserName} />
          </Link>

          <button
            type="button"
            className="app-navbar-toggle"
            aria-label={
              isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
            }
            aria-expanded={isMenuOpen}
            aria-controls="app-navbar-navigation"
            onClick={() => setIsMenuOpen((previous) => !previous)}
          >
            {isMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}