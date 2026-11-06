"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import "./momo-pet.css";
import { CatSprite, CreeperSprite, type EyeState } from "./MomoSprites";
import { useWorld, type Phase, type Weather } from "./momo-world";
import {
  ACCESSORIES,
  DEFAULT_SAVED,
  SKINS,
  applyOffline,
  clamp,
  greeting,
  levelProgress,
  unlocksAt,
  type Saved,
} from "./momo-data";

type Action = "idle" | "happy" | "eat" | "play" | "puff";
type Particle = { id: number; emoji: string; dx: number };
type Orb = { id: number; x: number; y: number; born: number };
type Burst = { id: number; x: number; y: number };
type Creeper = { x: number; dir: 1 | -1; fleeing: boolean };

const MIN_X = 18;
const MAX_X = 82;

const FEED_LINES = [
  "Nyam nyam! Ikannya enak! 🐟",
  "Ikan mentah favoritku! 🐟",
  "Terima kasih! Perutku hangat 💗",
];

/* Apakah tab sedang terlihat (timer dijeda kalau tersembunyi) */
function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

export default function MomoPet() {
  const world = useWorld();
  const visible = usePageVisible();

  /* ---------- data utama (tersimpan) ---------- */
  const [pet, setPet] = useState<Saved>(DEFAULT_SAVED);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  /* ---------- state sementara ---------- */
  const [message, setMessage] = useState<string | null>(null);
  const [action, setAction] = useState<Action>("idle");
  const [x, setX] = useState(50);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [creeper, setCreeper] = useState<Creeper | null>(null);
  const [fishKey, setFishKey] = useState(0);

  /* ---------- refs ---------- */
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
  });
  const petRef = useRef(pet);
  const xRef = useRef(50);
  const cursorRef = useRef<{ x: number; t: number } | null>(null);
  const creeperRef = useRef<Creeper | null>(null);
  const walkTimer = useRef<number | null>(null);
  const fishTimer = useRef<number | null>(null);
  const particleId = useRef(0);
  const orbId = useRef(0);
  const burstId = useRef(0);
  const wasSleeping = useRef(false);
  const prevLevel = useRef(1);
  const prevWeather = useRef<Weather>("clear");
  const prevPhase = useRef<Phase>("day");
  const worldInit = useRef(false);
  const pendingXpRef = useRef<Set<Promise<void>>>(new Set());
  const scoreRevisionRef = useRef(0);
  const resettingRef = useRef(false);

  const autosaveTimerRef = useRef<number | null>(null);
  const saveRevisionRef = useRef(0);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const dbVersionRef = useRef(0);
  const versionConflictRef = useRef(false);
  const xpBlockedUntilRef = useRef(0);

  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  useEffect(() => {
    xRef.current = x;
  }, [x]);

  const { level, pct } = levelProgress(pet.score);
  const sleeping = pet.asleep;
  const skin = SKINS.find((s) => s.id === pet.skin) ?? SKINS[0];
  const displayName = pet.name.trim() || "Momo";
  const eyes: EyeState = sleeping
    ? "sleep"
    : action === "happy" || action === "play"
      ? "happy"
      : "open";

  /* ---------- helpers ---------- */
  const say = useCallback((text: string) => setMessage(text), []);

  const awardXp = useCallback((
    activity: "creeper" | "pet" | "feed" | "play" | "orb"
  ): Promise<void> => {
    if (resettingRef.current || versionConflictRef.current) {
      return Promise.resolve();
    }

    if (Date.now() < xpBlockedUntilRef.current) {
      const remaining = Math.ceil(
        (xpBlockedUntilRef.current - Date.now()) / 1000
      );
      setMessage(
        `Batas aktivitas XP tercapai. Coba lagi dalam ${remaining} detik.`
      );
      return Promise.resolve();
    }

    const revision = scoreRevisionRef.current;
    const requestId = crypto.randomUUID();

    // XP dan autosave memakai antrean yang sama.
    const request = saveChainRef.current.then(async () => {
      if (
        resettingRef.current ||
        versionConflictRef.current ||
        revision !== scoreRevisionRef.current
      ) {
        return;
      }

      // Jangan kirim antrean XP yang tertunda selama cooldown.
      if (Date.now() < xpBlockedUntilRef.current) {
        return;
      }

      const response = await fetch("/api/momo/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activity,
          requestId,
          expectedVersion: dbVersionRef.current,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        debug?: string;
        data?: {
          score?: number;
          version?: number;
          awarded?: boolean;
        };
      };

      if (response.status === 409) {
        versionConflictRef.current = true;
        setMessage(
          "Data Momo berubah di perangkat lain. Muat ulang halaman sebelum melanjutkan."
        );
        return;
      }

      // Rate limit adalah kondisi normal, bukan error aplikasi.
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        const cooldownSeconds =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(300, Math.ceil(retryAfter))
            : 60;

        xpBlockedUntilRef.current =
          Date.now() + cooldownSeconds * 1000;

        setMessage(
          result.message ??
            `Batas aktivitas XP tercapai. Coba lagi setelah ${cooldownSeconds} detik.`
        );
        return;
      }

      if (
        !response.ok ||
        !result.success ||
        typeof result.data?.score !== "number" ||
        typeof result.data?.version !== "number"
      ) {
        throw new Error(
          process.env.NODE_ENV === "development"
            ? result.debug ?? result.message ?? "Gagal menyimpan XP Momo."
            : result.message ?? "Gagal menyimpan XP Momo."
        );
      }

      dbVersionRef.current = result.data.version;

      if (revision === scoreRevisionRef.current) {
        setPet((current) => ({
          ...current,
          score: Math.max(current.score, result.data!.score!),
        }));
      }
    }).catch((error: unknown) => {
      console.error("Gagal menambahkan XP Momo:", error);

      if (
        revision === scoreRevisionRef.current &&
        !versionConflictRef.current
      ) {
        setMessage("XP Momo gagal disimpan. Periksa koneksi internet.");
      }
    });

    saveChainRef.current = request;

    pendingXpRef.current.add(request);

    void request.finally(() => {
      pendingXpRef.current.delete(request);
    });

    return request;
  }, []);

  const spawn = useCallback((emoji: string, count = 3) => {
    const items: Particle[] = Array.from({ length: count }, () => ({
      id: ++particleId.current,
      emoji,
      dx: Math.round(Math.random() * 60 - 30),
    }));

    setParticles((p) => [...p, ...items]);

    window.setTimeout(() => {
      setParticles((p) => p.filter((i) => !items.some((n) => n.id === i.id)));
    }, 1200);
  }, []);

  const moveTo = useCallback((target: number) => {
    setFacing(target > xRef.current ? 1 : -1);
    setWalking(true);
    setX(target);

    if (walkTimer.current) {
      window.clearTimeout(walkTimer.current);
    }

    walkTimer.current = window.setTimeout(() => setWalking(false), 1700);
  }, []);

  /* ---------- antrekan penyimpanan data Momo ---------- */
  const queuePetSave = useCallback(
    (saved: Saved, keepalive = false): Promise<void> => {
      if (resettingRef.current || versionConflictRef.current) {
        return Promise.resolve();
      }

      const revision = saveRevisionRef.current;

      const queuedSave = saveChainRef.current.then(async () => {
        if (
          resettingRef.current ||
          versionConflictRef.current ||
          revision !== saveRevisionRef.current
        ) {
          return;
        }

        const response = await fetch("/api/momo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          keepalive,
          body: JSON.stringify({
            version: dbVersionRef.current,
            name: saved.name,
            energy: saved.energy,
            happiness: saved.happiness,
            fullness: saved.fullness,
            asleep: saved.asleep,
            skin: saved.skin,
            accessory: saved.accessory,
            animations: saved.animations,
            autoMove: saved.autoMove,
            chase: saved.chase,
          }),
        });

        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          data?: {
            version?: number;
          };
        };

        if (response.status === 409) {
          versionConflictRef.current = true;
          setMessage(
            "Data Momo berubah di perangkat lain. Muat ulang halaman sebelum melanjutkan."
          );
          return;
        }

        if (
          !response.ok ||
          !result.success ||
          typeof result.data?.version !== "number"
        ) {
          throw new Error(result.message ?? "Gagal menyimpan data Momo.");
        }

        dbVersionRef.current = result.data.version;
      });

      saveChainRef.current = queuedSave.catch((error: unknown) => {
        console.error("Gagal menyinkronkan data Momo:", error);
      });

      return saveChainRef.current;
    },
    []
  );

  /* ---------- muat data Momo dari database ---------- */
  useEffect(() => {
    let cancelled = false;

    async function initializePet() {
      try {
        const response = await fetch("/api/momo", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Gagal memuat Momo: HTTP ${response.status}`);
        }

        const result = (await response.json()) as {
          success?: boolean;
          isNew?: boolean;
          userId?: string;
          data?: {
            name?: unknown;
            score?: unknown;
            version?: unknown;
            energy?: unknown;
            happiness?: unknown;
            fullness?: unknown;
            asleep?: unknown;
            skin?: unknown;
            accessory?: unknown;
            animations?: unknown;
            autoMove?: unknown;
            chase?: unknown;
            lastSeen?: unknown;
            lastCheckin?: unknown;
          };
        };

        if (
          !result.success ||
          !result.data ||
          typeof result.userId !== "string" ||
          !result.userId
        ) {
          throw new Error("Identitas pengguna atau data Momo tidak valid.");
        }

        if (cancelled) return;

        const activeUserId = result.userId;
        const remote = result.data;
        const now = Date.now();

        const safeNumber = (value: unknown, fallback: number) =>
          typeof value === "number" && Number.isFinite(value)
            ? value
            : fallback;

        const databaseSaved: Saved = {
          ...DEFAULT_SAVED,
          name:
            typeof remote.name === "string" && remote.name.trim()
              ? remote.name.trim().slice(0, 12)
              : DEFAULT_SAVED.name,
          score: Math.max(
            0,
            Math.min(1_000_000, Math.floor(safeNumber(remote.score, 0)))
          ),
          version: Math.max(0, Math.floor(safeNumber(remote.version, 0))),
          energy: clamp(safeNumber(remote.energy, DEFAULT_SAVED.energy)),
          happiness: clamp(
            safeNumber(remote.happiness, DEFAULT_SAVED.happiness)
          ),
          fullness: clamp(
            safeNumber(remote.fullness, DEFAULT_SAVED.fullness)
          ),
          asleep:
            typeof remote.asleep === "boolean"
              ? remote.asleep
              : DEFAULT_SAVED.asleep,
          skin: SKINS.some((item) => item.id === remote.skin)
            ? (remote.skin as Saved["skin"])
            : DEFAULT_SAVED.skin,
          accessory: ACCESSORIES.some(
            (item) => item.id === remote.accessory
          )
            ? (remote.accessory as Saved["accessory"])
            : DEFAULT_SAVED.accessory,
          animations:
            typeof remote.animations === "boolean"
              ? remote.animations
              : DEFAULT_SAVED.animations,
          autoMove:
            typeof remote.autoMove === "boolean"
              ? remote.autoMove
              : DEFAULT_SAVED.autoMove,
          chase:
            typeof remote.chase === "boolean"
              ? remote.chase
              : DEFAULT_SAVED.chase,
          lastSeen: safeNumber(remote.lastSeen, now),
          lastCheckin:
            typeof remote.lastCheckin === "string"
              ? remote.lastCheckin
              : "",
        };

        dbVersionRef.current = databaseSaved.version;
        versionConflictRef.current = false;

        // Terapkan penurunan stat berdasarkan waktu terakhir tersimpan di DB.
        const offline = applyOffline(databaseSaved, now);
        const loaded: Saved = {
          ...offline.saved,
          lastSeen: now,
        };

        const currentLevel = levelProgress(loaded.score).level;
        const selectedSkin = SKINS.find((item) => item.id === loaded.skin);
        const selectedAccessory = ACCESSORIES.find(
          (item) => item.id === loaded.accessory
        );

        if (!selectedSkin || selectedSkin.level > currentLevel) {
          loaded.skin = "salju";
        }

        if (
          !selectedAccessory ||
          selectedAccessory.level > currentLevel
        ) {
          loaded.accessory = "none";
        }

        if (cancelled) return;

        setUserId(activeUserId);
        prevLevel.current = levelProgress(loaded.score).level;
        wasSleeping.current = loaded.asleep;
        petRef.current = loaded;

        setPet(loaded);
        setHydrated(true);

        setMessage(
          greeting(
            offline.hours,
            new Date().getHours(),
            Boolean(result.isNew),
            loaded.name,
          )
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Gagal memuat data Momo:", error);
          setMessage("Data Momo gagal dimuat. Silakan muat ulang halaman.");
        }
      }
    }

    void initializePet();

    return () => {
      cancelled = true;
    };
  }, [spawn]);

  /* ---------- simpan seluruh data Momo ke database ---------- */
  useEffect(() => {
    if (!hydrated || !userId || resettingRef.current) return;

    const saved: Saved = {
      ...pet,
      lastSeen: Date.now(),
    };

    petRef.current = saved;

    // Simpan revisi agar timer lama tidak berjalan setelah reset.
    const revision = saveRevisionRef.current;

    const timer = window.setTimeout(() => {
      if (autosaveTimerRef.current === timer) {
        autosaveTimerRef.current = null;
      }

      if (
        resettingRef.current ||
        revision !== saveRevisionRef.current
      ) {
        return;
      }

      void queuePetSave(saved);
    }, 700);

    autosaveTimerRef.current = timer;

    return () => {
      window.clearTimeout(timer);

      if (autosaveTimerRef.current === timer) {
        autosaveTimerRef.current = null;
      }
    };
  }, [pet, hydrated, userId, queuePetSave]);

  /* ---------- hitung waktu saat tab tidak aktif ---------- */
  useEffect(() => {
    if (!hydrated || !userId) return;

    let hiddenAt = 0;

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();

        // Gunakan antrean yang sama agar tidak bertabrakan dengan reset.
        if (!resettingRef.current) {
          void queuePetSave(petRef.current, true);
        }
      } else if (hiddenAt) {
        const now = Date.now();

        if (now - hiddenAt > 5 * 60_000) {
          const { saved, hours } = applyOffline(
            {
              ...petRef.current,
              lastSeen: hiddenAt,
            },
            now
          );

          const resumed: Saved = {
            ...saved,
            lastSeen: now,
          };

          petRef.current = resumed;
          setPet(resumed);

          setMessage(
            hours >= 6
              ? "Kamu lama tidak datang... aku kangen! 💗"
              : "Selamat datang kembali! 👋"
          );
        }

        hiddenAt = 0;
      }
    }

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hydrated, userId, queuePetSave]);

  /* ---------- reset action ---------- */
  useEffect(() => {
    if (action === "idle") return;

    const timer = window.setTimeout(
      () => setAction("idle"),
      action === "puff" ? 1300 : 1000,
    );

    return () => window.clearTimeout(timer);
  }, [action]);

  /* ---------- sembunyikan bubble ---------- */
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => setMessage(null), 4500);

    return () => window.clearTimeout(timer);
  }, [message]);

  /* ---------- stat turun pelan setiap 30 detik ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return;

    const weather = world.weather;

    const timer = window.setInterval(() => {
      const now = Date.now();

      setPet((p) => {
        const energy = p.asleep ? clamp(p.energy + 50) : clamp(p.energy - 1);

        const asleep = p.asleep ? energy < 50 : energy < 20;

        const moodShift = weather === "rain" ? -2 : weather === "snow" ? 0 : -1;

        return {
          ...p,
          fullness: clamp(p.fullness - 1),
          happiness: clamp(p.happiness + moodShift),
          energy,
          asleep,
          lastSeen: now,
        };
      });
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [hydrated, visible, world.weather]);

  /* ---------- pesan tidur / bangun ---------- */
  useEffect(() => {
    if (!hydrated) return;

    const previousSleeping = wasSleeping.current;
    wasSleeping.current = sleeping;

    if (previousSleeping === sleeping) return;

    const timer = window.setTimeout(
      () =>
        say(
          sleeping
            ? "Zzz... aku ngantuk 😴"
            : "Hoaam... aku sudah segar lagi! ☀️",
        ),
      0,
    );

    return () => window.clearTimeout(timer);
  }, [sleeping, hydrated, say]);

  /* ---------- pesan saat cuaca / malam berubah ---------- */
  useEffect(() => {
    if (!hydrated) return;

    if (!worldInit.current) {
      worldInit.current = true;
      prevWeather.current = world.weather;
      prevPhase.current = world.phase;
      return;
    }

    const previousWeather = prevWeather.current;
    const previousPhase = prevPhase.current;

    prevWeather.current = world.weather;
    prevPhase.current = world.phase;

    let text: string | null = null;

    if (world.weather !== previousWeather) {
      text =
        world.weather === "rain"
          ? "Hujan turun... 🌧️ aku jadi agak murung"
          : world.weather === "snow"
            ? "Salju! ❄️ Dingin tapi seru!"
            : "Cuacanya cerah lagi! ☀️";
    } else if (world.phase !== previousPhase && world.phase === "night") {
      text = "Sudah malam. Bintangnya cantik ya ✨";
    }

    if (!text) return;

    const nextMessage = text;
    const timer = window.setTimeout(() => say(nextMessage), 0);

    return () => window.clearTimeout(timer);
  }, [hydrated, world.weather, world.phase, say]);

  /* ---------- pengingat istirahat larut malam ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return;

    const timer = window.setInterval(() => {
      const hour = new Date().getHours();

      if ((hour >= 23 || hour < 4) && !petRef.current.asleep) {
        setMessage("Sudah larut... istirahat dulu ya, besok lanjut lagi 🌙");
      }
    }, 15 * 60_000);

    return () => window.clearInterval(timer);
  }, [hydrated, visible]);

  /* ---------- level naik ---------- */
  useEffect(() => {
    if (!hydrated) return;

    if (level <= prevLevel.current) {
      prevLevel.current = level;
      return;
    }

    prevLevel.current = level;
    const items = unlocksAt(level);

    const timer = window.setTimeout(() => {
      setAction("play");
      spawn("⭐", 5);

      say(
        `Level ${level}! ${
          items.length ? `Baru: ${items.join(", ")} 🎁` : "🎉"
        }`,
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [level, hydrated, say, spawn]);

  /* ---------- lacak posisi kursor di sekitar area Momo ---------- */
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const el = stageRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      if (
        e.clientY < rect.top - 60 ||
        e.clientY > rect.bottom + 60 ||
        e.clientX < rect.left - 60 ||
        e.clientX > rect.right + 60
      ) {
        cursorRef.current = null;
        return;
      }

      cursorRef.current = {
        x: clamp(((e.clientX - rect.left) / rect.width) * 100, MIN_X, MAX_X),
        t: performance.now(),
      };
    }

    window.addEventListener("pointermove", onMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  /* ---------- jalan sendiri / mengejar kursor ---------- */
  useEffect(() => {
    if (!hydrated || !visible || pet.asleep || !pet.autoMove) {
      return;
    }

    const chase = pet.chase;

    const timer = window.setInterval(() => {
      if (dragRef.current.active) return;

      const cursor = cursorRef.current;

      if (chase && cursor && performance.now() - cursor.t < 2500) {
        if (Math.abs(cursor.x - xRef.current) < 8) {
          return;
        }

        const step = Math.max(-24, Math.min(24, cursor.x - xRef.current));

        moveTo(clamp(xRef.current + step, MIN_X, MAX_X));

        return;
      }

      if (Math.random() < 0.35) return;

      const target = clamp(
        xRef.current + (Math.random() * 50 - 25),
        MIN_X,
        MAX_X,
      );

      if (Math.abs(target - xRef.current) < 6) return;

      moveTo(target);
    }, 1500);

    return () => window.clearInterval(timer);
  }, [hydrated, visible, pet.asleep, pet.autoMove, pet.chase, moveTo]);

  /* ---------- creeper: muncul sesekali ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return;

    const timer = window.setInterval(() => {
      if (creeperRef.current || petRef.current.asleep || Math.random() > 0.35) {
        return;
      }

      const fromLeft = Math.random() < 0.5;

      const nextCreeper: Creeper = {
        x: fromLeft ? -10 : 110,
        dir: fromLeft ? 1 : -1,
        fleeing: false,
      };

      creeperRef.current = nextCreeper;
      setCreeper(nextCreeper);
    }, 25_000);

    return () => window.clearInterval(timer);
  }, [hydrated, visible]);

  const hasCreeper = creeper !== null;

  useEffect(() => {
    if (!hasCreeper || !visible) return;

    const timer = window.setInterval(() => {
      const current = creeperRef.current;
      if (!current) return;

      let next: Creeper = {
        ...current,
        x: current.x + current.dir * (current.fleeing ? 2.4 : 0.9),
      };

      if (
        !next.fleeing &&
        !petRef.current.asleep &&
        Math.abs(next.x - xRef.current) < 20
      ) {
        next = {
          ...next,
          fleeing: true,
          dir: next.dir === 1 ? -1 : 1,
        };

        setAction("puff");
        setMessage("Hsss! Pergi sana, Creeper! 😾");

        setPet((p) => ({
          ...p,
          happiness: clamp(p.happiness + 3),
        }));

        void awardXp("creeper");
      }

      if (next.x < -16 || next.x > 116) {
        creeperRef.current = null;
        setCreeper(null);
        return;
      }

      creeperRef.current = next;
      setCreeper(next);
    }, 120);

    return () => window.clearInterval(timer);
  }, [hasCreeper, visible, awardXp]);

  /* ---------- XP orb: muncul acak, hilang sendiri ---------- */
  useEffect(() => {
    if (!hydrated || !visible) return;

    const timer = window.setInterval(() => {
      const now = Date.now();
      const skip = Math.random() > 0.7;

      const fresh: Orb = {
        id: ++orbId.current,
        x: MIN_X - 8 + Math.random() * (MAX_X - MIN_X + 16),
        y: 50 + Math.random() * 100,
        born: now,
      };

      setOrbs((previous) => {
        const alive = previous.filter((orb) => now - orb.born < 12_000);

        return alive.length >= 3 || skip ? alive : [...alive, fresh];
      });
    }, 7000);

    return () => window.clearInterval(timer);
  }, [hydrated, visible]);

  /* ---------- aksi elus Momo ---------- */
  function petMomo() {
    if (sleeping) {
      say(`Zzz... (${displayName} masih tidur)`);
      return;
    }

    setPet((p) => ({
      ...p,
      happiness: clamp(p.happiness + 8),
    }));

    void awardXp("pet");

    setAction("happy");
    spawn("💗");
    say("Meow! Aku suka dielus! 💗");
  }

  /* ---------- aksi memberi makan ---------- */
  function feedMomo() {
    if (sleeping) {
      say(`Zzz... (${displayName} masih tidur)`);
      return;
    }

    if (pet.fullness >= 100) {
      setAction("happy");
      say("Aku sudah kenyang! 🐟");
      return;
    }

    setPet((p) => ({
      ...p,
      fullness: clamp(p.fullness + 15),
      energy: clamp(p.energy + 10),
    }));

    void awardXp("feed");

    setAction("eat");
    setFishKey((key) => key + 1);

    if (fishTimer.current) {
      window.clearTimeout(fishTimer.current);
    }

    fishTimer.current = window.setTimeout(() => setFishKey(0), 900);

    say(FEED_LINES[Math.floor(Math.random() * FEED_LINES.length)]);
  }

  /* ---------- aksi bermain dengan Momo ---------- */
  function playWithMomo() {
    if (sleeping) {
      say(`Zzz... (${displayName} masih tidur)`);
      return;
    }

    if (pet.energy < 15) {
      say("Aku capek. Istirahat dulu, ya!");
      return;
    }

    setPet((p) => ({
      ...p,
      happiness: clamp(p.happiness + 12),
      energy: clamp(p.energy - 15),
      fullness: clamp(p.fullness - 5),
    }));

    void awardXp("play");

    setAction("play");
    spawn("✨", 4);
    say("Yeay! Main lagi! ✨");
  }

  /* ---------- kumpulkan XP orb ---------- */
  function collectOrb(orb: Orb) {
    setOrbs((previous) => previous.filter((item) => item.id !== orb.id));

    setPet((p) => ({
      ...p,
      happiness: clamp(p.happiness + 1),
    }));

    void awardXp("orb");

    const id = ++burstId.current;

    setBursts((previous) => [
      ...previous,
      {
        id,
        x: orb.x,
        y: orb.y,
      },
    ]);

    window.setTimeout(() => {
      setBursts((previous) => previous.filter((item) => item.id !== id));
    }, 900);
  }

  /* ---------- reset progres Momo di database ---------- */
  async function resetAll() {
    if (!userId || resettingRef.current) return;

    resettingRef.current = true;
    scoreRevisionRef.current += 1;

    // Batalkan autosave yang belum sempat dikirim.
    saveRevisionRef.current += 1;

    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    try {
      // Selesaikan penyimpanan lama sebelum reset database.
      await saveChainRef.current;

      // Selesaikan XP yang sudah dikirim sebelum reset database.
      await Promise.all(Array.from(pendingXpRef.current));

      type ResetApiResult = {
        success?: boolean;
        message?: string;
        data?: {
          version?: number;
          name?: string;
          animations?: boolean;
          autoMove?: boolean;
          chase?: boolean;
          lastCheckin?: string;
          lastSeen?: number;
        };
      };

      async function sendResetRequest(expectedVersion: number) {
        const response = await fetch("/api/momo/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedVersion }),
        });

        const result = (await response.json()) as ResetApiResult;
        return { response, result };
      }

      let { response, result } = await sendResetRequest(
        dbVersionRef.current
      );

      // Jika versi kedaluwarsa, ambil versi database terbaru.
      // Reset dicoba ulang maksimal satu kali.
      if (response.status === 409) {
        const latestResponse = await fetch("/api/momo", {
          method: "GET",
          cache: "no-store",
        });

        const latestResult = (await latestResponse.json()) as {
          success?: boolean;
          data?: {
            version?: unknown;
          };
        };

        if (
          !latestResponse.ok ||
          !latestResult.success ||
          typeof latestResult.data?.version !== "number" ||
          !Number.isSafeInteger(latestResult.data.version)
        ) {
          throw new Error(
            "Gagal mengambil versi Momo terbaru. Muat ulang halaman."
          );
        }

        dbVersionRef.current = latestResult.data.version;

        ({ response, result } = await sendResetRequest(
          dbVersionRef.current
        ));
      }

      // Jangan memaksakan reset jika konflik terjadi kembali.
      if (response.status === 409) {
        versionConflictRef.current = true;
        setMessage(
          "Data Momo masih berubah di perangkat lain. Muat ulang halaman sebelum reset."
        );
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Reset Momo gagal.");
      }

      const fresh: Saved = {
        ...DEFAULT_SAVED,
        version: typeof result.data?.version === "number"
          ? result.data.version
          : dbVersionRef.current,
        name: typeof result.data?.name === "string"
          ? result.data.name
          : petRef.current.name,
        animations: typeof result.data?.animations === "boolean"
          ? result.data.animations
          : petRef.current.animations,
        autoMove: typeof result.data?.autoMove === "boolean"
          ? result.data.autoMove
          : petRef.current.autoMove,
        chase: typeof result.data?.chase === "boolean"
          ? result.data.chase
          : petRef.current.chase,
        lastCheckin:
          typeof result.data?.lastCheckin === "string"
            ? result.data.lastCheckin
            : petRef.current.lastCheckin,
        lastSeen:
          typeof result.data?.lastSeen === "number"
            ? result.data.lastSeen
            : Date.now(),
      };

      dbVersionRef.current = fresh.version;
      versionConflictRef.current = false;
      prevLevel.current = 1;
      wasSleeping.current = false;
      petRef.current = fresh;

      setPet(fresh);
      setConfirmReset(false);
      setSettingsOpen(false);
      setX(50);
      setMessage(`Halo lagi! Aku ${fresh.name}. Senang bertemu denganmu! ✨`);
    } catch (error) {
      console.warn("Gagal mereset Momo:", error);
      setMessage("Reset Momo gagal disimpan. Silakan coba lagi.");
    } finally {
      resettingRef.current = false;
    }
  }
  /* ---------- drag Momo ---------- */
  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current.active || !stageRef.current) {
      return;
    }

    if (
      !dragRef.current.moved &&
      Math.abs(e.clientX - dragRef.current.startX) > 5
    ) {
      dragRef.current.moved = true;
      setDragging(true);
      setWalking(false);
    }

    if (!dragRef.current.moved) return;

    const rect = stageRef.current.getBoundingClientRect();

    const next = clamp(
      ((e.clientX - rect.left) / rect.width) * 100,
      MIN_X,
      MAX_X,
    );

    setFacing(next > xRef.current ? 1 : -1);
    setX(next);
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (wasMoved) {
      setDragging(false);
      say("Wuuush! Seru! 🎈");
    } else {
      petMomo();
    }
  }

  function onPointerCancel(e: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current.active = false;
    dragRef.current.moved = false;
    setDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  const cls = [
    "momo-character",
    action,
    walking ? "walking" : "",
    sleeping ? "sleeping" : "",
    dragging ? "dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside
      className={`momo-pet ${pet.animations ? "" : "no-anim"}`}
      aria-label={`Pet virtual ${displayName}`}
    >
      <span className="momo-sr" role="status" aria-live="polite">
        {message ?? ""}
      </span>

      <div className="momo-garden" ref={stageRef}>
        {creeper && (
          <div
            className={`momo-creeper ${creeper.fleeing ? "is-fleeing" : ""}`}
            style={{ left: `${creeper.x}%` }}
          >
            <CreeperSprite />
          </div>
        )}

        {orbs.map((orb) => (
          <button
            key={orb.id}
            type="button"
            className="momo-orb"
            aria-label="Ambil XP orb"
            style={{
              left: `${orb.x}%`,
              bottom: `calc(var(--momo-floor) + ${orb.y}px)`,
            }}
            onClick={() => collectOrb(orb)}
          />
        ))}

        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="momo-burst"
            style={{
              left: `${burst.x}%`,
              bottom: `calc(var(--momo-floor) + ${burst.y}px)`,
            }}
          >
            +2 XP
          </span>
        ))}

        <div
          className={`momo-walker ${dragging ? "is-dragging" : ""}`}
          style={{ left: `${x}%` }}
        >
          {message && (
            <div className="momo-bubble" key={message} aria-hidden="true">
              {message}
            </div>
          )}

          {particles.map((particle) => (
            <span
              key={particle.id}
              className="momo-particle"
              style={{
                ["--dx" as string]: `${particle.dx}px`,
              }}
            >
              {particle.emoji}
            </span>
          ))}

          {fishKey > 0 && (
            <span key={fishKey} className="momo-fish">
              🐟
            </span>
          )}

          {sleeping && <span className="momo-zzz">Zzz</span>}

          <span className="momo-ground" />

          <button
            type="button"
            className={cls}
            aria-label={`Elus ${displayName} (tahan dan geser untuk memindahkan)`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                petMomo();
              }
            }}
          >
            <span
              className="momo-flip"
              style={{ transform: `scaleX(${facing})` }}
            >
              <CatSprite
                eyes={eyes}
                eating={action === "eat"}
                skin={skin}
                accessory={pet.accessory}
              />
            </span>
          </button>
        </div>
      </div>
      <button
        type="button"
        className="momo-mobile-toggle"
        aria-expanded={!mobileCollapsed}
        aria-controls="momo-mobile-panel"
        onClick={() => setMobileCollapsed((value) => !value)}
      >
        <span>🐱 {displayName}</span>
        <span>{mobileCollapsed ? "Buka panel ＋" : "Tutup panel −"}</span>
      </button>

      <div
        id="momo-mobile-panel"
        className={`momo-panel ${mobileCollapsed ? "momo-mobile-collapsed" : ""}`}
      >
        <header className="momo-heading">
          <span className="momo-heading-icon">🌿</span>

          <strong>{displayName}</strong>

          <span className="momo-level">Lv. {level}</span>

          <button
            type="button"
            className="momo-gear"
            aria-label={`Pengaturan ${displayName}`}
            aria-expanded={settingsOpen}
            onClick={() => {
              setSettingsOpen((value) => !value);
              setConfirmReset(false);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </button>
        </header>

        <div
          className="momo-xp"
          role="progressbar"
          aria-label="Progres menuju level berikutnya"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${pct}%` }} />
        </div>

        {settingsOpen ? (
          <div className="momo-settings">
            <label className="momo-field">
              <span>Nama hewan peliharaan</span>

              <input
                type="text"
                value={pet.name}
                maxLength={12}
                onChange={(e) => {
                  const value = e.target.value;

                  setPet((p) => ({
                    ...p,
                    name: value,
                  }));
                }}
                onBlur={() => {
                  if (!pet.name.trim()) {
                    setPet((p) => ({
                      ...p,
                      name: "Momo",
                    }));
                  }
                }}
              />
            </label>

            <div className="momo-toggles">
              <label>
                <input
                  type="checkbox"
                  checked={pet.animations}
                  onChange={(e) => {
                    const value = e.target.checked;

                    setPet((p) => ({
                      ...p,
                      animations: value,
                    }));
                  }}
                />
                Animasi {displayName}
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={pet.autoMove}
                  onChange={(e) => {
                    const value = e.target.checked;

                    setPet((p) => ({
                      ...p,
                      autoMove: value,
                    }));
                  }}
                />
                Jalan sendiri
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={pet.chase}
                  onChange={(e) => {
                    const value = e.target.checked;

                    setPet((p) => ({
                      ...p,
                      chase: value,
                    }));
                  }}
                />
                Kejar kursor
              </label>
            </div>

            <fieldset className="momo-group">
              <legend>Warna bulu</legend>

              <div className="momo-choices">
                {SKINS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="momo-choice"
                    aria-pressed={pet.skin === item.id}
                    disabled={level < item.level}
                    onClick={() => {
                      setPet((p) => ({
                        ...p,
                        skin: item.id,
                      }));
                    }}
                  >
                    <i
                      style={{
                        background: item.swatch,
                      }}
                    />

                    {item.label}

                    {level < item.level ? ` · Lv.${item.level}` : ""}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="momo-group">
              <legend>Aksesori</legend>

              <div className="momo-choices">
                {ACCESSORIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="momo-choice"
                    aria-pressed={pet.accessory === item.id}
                    disabled={level < item.level}
                    onClick={() => {
                      setPet((p) => ({
                        ...p,
                        accessory: item.id,
                      }));
                    }}
                  >
                    {item.label}

                    {level < item.level ? ` · Lv.${item.level}` : ""}
                  </button>
                ))}
              </div>
            </fieldset>

            {confirmReset ? (
              <div className="momo-confirm">
                <span>Hapus semua progres?</span>

                <button type="button" onClick={resetAll}>
                  Ya, reset
                </button>

                <button type="button" onClick={() => setConfirmReset(false)}>
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="momo-reset"
                onClick={() => setConfirmReset(true)}
              >
                Reset progres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="momo-stats">
              <PetStat icon="💗" label="Kebahagiaan" value={pet.happiness} />

              <PetStat icon="🐟" label="Kenyang" value={pet.fullness} />

              <PetStat icon="⚡" label="Energi" value={pet.energy} />
            </div>

            <div className="momo-actions">
              <button type="button" onClick={petMomo}>
                <span>💗</span>Elus
              </button>

              <button type="button" onClick={feedMomo}>
                <span>🐟</span>Beri Makan
              </button>

              <button type="button" onClick={playWithMomo}>
                <span>🎮</span>Main
              </button>
            </div>

            <div className="momo-score">
              <span>⭐ Skor bermain</span>
              <strong>{pet.score}</strong>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
function PetStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="momo-stat">
      <span className="momo-stat-icon">{icon}</span>

      <span className="momo-stat-label">{label}</span>

      <div
        className="momo-progress"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
