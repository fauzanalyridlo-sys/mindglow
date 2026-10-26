export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))

/* ---------- Skin & aksesori ---------- */
export type SkinId = 'salju' | 'jahe' | 'abu' | 'siam' | 'malam'
export type AccessoryId = 'none' | 'syal' | 'kacamata' | 'topi' | 'mahkota'

export type Skin = {
    id: SkinId
    label: string
    level: number
    fur: string
    shade: string
    accent: string
    accentD: string
    chest: string
    ear: string
    eye: string
    lid: string
    nose: string
    mouth: string
    swatch: string
}

export const SKINS: Skin[] = [
    {
        id: 'salju', label: 'Salju', level: 1,
        fur: '#fffdf3', shade: '#e3e8da', accent: '#a9d4a4', accentD: '#7fb98a',
        chest: '#ffffff', ear: '#f6b9c0', eye: '#3b4a40', lid: '#3b4a40',
        nose: '#f08fa0', mouth: '#5a4044', swatch: '#fffdf3',
    },
    {
        id: 'jahe', label: 'Jahe', level: 2,
        fur: '#f2a65a', shade: '#d98a3d', accent: '#d9782a', accentD: '#b9601c',
        chest: '#ffe9c8', ear: '#f6b9c0', eye: '#3b2a1a', lid: '#4a2e1a',
        nose: '#e06f7f', mouth: '#5a3326', swatch: '#f2a65a',
    },
    {
        id: 'abu', label: 'Abu', level: 3,
        fur: '#b8bec6', shade: '#9aa1aa', accent: '#8e96a0', accentD: '#737b86',
        chest: '#e6eaee', ear: '#f2b9c4', eye: '#2b3440', lid: '#2e3440',
        nose: '#e98c9c', mouth: '#4a4048', swatch: '#b8bec6',
    },
    {
        id: 'siam', label: 'Siam', level: 4,
        fur: '#f4ead8', shade: '#dccfb8', accent: '#8a6a55', accentD: '#6e5240',
        chest: '#fff7e8', ear: '#c9a08a', eye: '#4aa3d8', lid: '#5e4536',
        nose: '#b5707a', mouth: '#4a3a32', swatch: '#f4ead8',
    },
    {
        id: 'malam', label: 'Malam', level: 5,
        fur: '#3a3d46', shade: '#2a2c34', accent: '#565b6a', accentD: '#444956',
        chest: '#4a4e5a', ear: '#8a5a6a', eye: '#ffd23f', lid: '#ffd23f',
        nose: '#e98c9c', mouth: '#f0b8c0', swatch: '#3a3d46',
    },
]

export type Accessory = { id: AccessoryId; label: string; level: number }

export const ACCESSORIES: Accessory[] = [
    { id: 'none', label: 'Polos', level: 1 },
    { id: 'syal', label: 'Syal', level: 2 },
    { id: 'kacamata', label: 'Kacamata', level: 3 },
    { id: 'topi', label: 'Topi Penyihir', level: 4 },
    { id: 'mahkota', label: 'Mahkota', level: 6 },
]

/* ---------- Level ---------- */
export const levelFor = (score: number) => 1 + Math.floor(Math.sqrt(Math.max(0, score) / 15))
export const scoreForLevel = (level: number) => 15 * (level - 1) ** 2

export function levelProgress(score: number) {
    const level = levelFor(score)
    const a = scoreForLevel(level)
    const b = scoreForLevel(level + 1)
    return { level, pct: Math.min(100, Math.round(((score - a) / (b - a)) * 100)) }
}

export function unlocksAt(level: number): string[] {
    return [
        ...SKINS.filter((s) => s.level === level).map((s) => `bulu ${s.label}`),
        ...ACCESSORIES.filter((a) => a.level === level).map((a) => a.label),
    ]
}

/* ---------- Data tersimpan ---------- */
export type Saved = {
    v: 1
    name: string
    happiness: number
    fullness: number
    energy: number
    asleep: boolean
    score: number
    skin: SkinId
    accessory: AccessoryId
    animations: boolean
    autoMove: boolean
    chase: boolean
    lastSeen: number
    lastCheckin: string
}

export const DEFAULT_SAVED: Saved = {
    v: 1,
    name: 'Momo',
    happiness: 70,
    fullness: 65,
    energy: 80,
    asleep: false,
    score: 0,
    skin: 'salju',
    accessory: 'none',
    animations: true,
    autoMove: true,
    chase: true,
    lastSeen: 0,
    lastCheckin: '',
}

const KEY = 'momo-pet-v1'

function num(v: unknown, d: number, min = 0, max = 100) {
    return typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d
}

function sanitize(raw: unknown): Saved | null {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    const score = num(r.score, 0, 0, 1_000_000)
    const level = levelFor(score)

    const skinFound = SKINS.find((s) => s.id === r.skin)
    const skin: SkinId = skinFound && skinFound.level <= level ? skinFound.id : 'salju'

    const accFound = ACCESSORIES.find((a) => a.id === r.accessory)
    const accessory: AccessoryId = accFound && accFound.level <= level ? accFound.id : 'none'

    return {
        v: 1,
        name: typeof r.name === 'string' && r.name.trim() ? r.name.slice(0, 12) : 'Momo',
        happiness: num(r.happiness, 70),
        fullness: num(r.fullness, 65),
        energy: num(r.energy, 80),
        asleep: r.asleep === true,
        score,
        skin,
        accessory,
        animations: r.animations !== false,
        autoMove: r.autoMove !== false,
        chase: r.chase !== false,
        lastSeen: num(r.lastSeen, Date.now(), 0, Number.MAX_SAFE_INTEGER),
        lastCheckin: typeof r.lastCheckin === 'string' ? r.lastCheckin : '',
    }
}

export function loadSaved(): Saved | null {
    try {
        const raw = window.localStorage.getItem(KEY)
        return raw ? sanitize(JSON.parse(raw)) : null
    } catch {
        return null
    }
}

export function saveSaved(s: Saved) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
        /* penyimpanan penuh / diblokir: abaikan */
    }
}

export function clearSaved() {
    try {
        window.localStorage.removeItem(KEY)
    } catch {
        /* abaikan */
    }
}

/* Penurunan stat selama pengguna tidak ada (dibuat lembut, ada batas bawah) */
export function applyOffline(s: Saved, now: number): { saved: Saved; hours: number } {
    const hours = Math.max(0, Math.min(48, (now - s.lastSeen) / 3_600_000))
    if (hours < 0.1) return { saved: s, hours }

    const fullness = Math.max(Math.min(s.fullness, 15), Math.round(s.fullness - hours * 4))
    const happiness = Math.max(Math.min(s.happiness, 20), Math.round(s.happiness - hours * 3))
    const energy = Math.min(100, Math.round(s.energy + hours * 8))
    const asleep = energy < 20 || (s.asleep && energy < 50)

    return { hours, saved: { ...s, fullness, happiness, energy, asleep } }
}

export function todayKey() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function greeting(hoursAway: number, hour: number, first: boolean): string {
    if (first) return 'Halo! Aku Momo. Senang bertemu denganmu! ✨'
    if (hoursAway >= 24) return 'Kamu lama sekali tidak datang... aku kangen! 💗'
    if (hoursAway >= 6) return 'Akhirnya kamu kembali! Aku kangen 💗'
    if (hour >= 23 || hour < 4) return 'Sudah larut... jangan lupa istirahat ya 🌙'
    if (hour < 11) return 'Selamat pagi! Sudah sarapan? ☀️'
    if (hour < 15) return 'Selamat siang! Jangan lupa minum air 💧'
    if (hour < 19) return 'Selamat sore! Satu langkah kecil saja cukup 🌿'
    return 'Selamat malam! Waktunya pelan-pelan ya 🌙'
}