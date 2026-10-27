
import { useSyncExternalStore } from 'react'

export type Phase = 'dawn' | 'day' | 'dusk' | 'night'
export type Weather = 'clear' | 'rain' | 'snow'
export type World = { hour: number; phase: Phase; weather: Weather }

/* Nilai awal server agar hidrasi tidak bentrok */
const SERVER_WORLD: World = {
    hour: 12,
    phase: 'day',
    weather: 'clear',
}

export function phaseOf(hour: number): Phase {
    if (hour >= 5 && hour < 7) return 'dawn'
    if (hour >= 7 && hour < 17) return 'day'
    if (hour >= 17 && hour < 19) return 'dusk'
    return 'night'
}

const CLOCK_CHECK_INTERVAL = 30_000
const WEATHER_CHECK_INTERVAL = 3 * 60 * 1000
const MIN_SNOW_DURATION = 6 * 60 * 1000
const SNOW_CHANCE = 0.02
const CLEAR_CHANCE = 0.35

let world: World = SERVER_WORLD
let naturalWeather: Weather = 'clear'
let weatherStartedAt = Date.now()

let hourOverride: number | null = null
let weatherOverride: Weather | null = null

let timers: number[] = []
const listeners = new Set<() => void>()

function currentHour(): number {
    if (hourOverride !== null) return hourOverride
    return new Date().getHours()
}

function recompute() {
    const hour = Math.floor(currentHour())

    /* Hujan dinonaktifkan: cuaca otomatis hanya cerah atau salju */
    const weather: Weather =
        weatherOverride === 'snow' ? 'snow' : naturalWeather

    const phase = phaseOf(hour)

    if (
        hour === world.hour &&
        weather === world.weather &&
        phase === world.phase
    ) {
        return
    }

    world = { hour, phase, weather }
    listeners.forEach((listener) => listener())
}

function rollWeather() {
    const now = Date.now()
    const elapsed = now - weatherStartedAt

    if (naturalWeather === 'snow') {
        if (elapsed < MIN_SNOW_DURATION) return

        if (Math.random() < CLEAR_CHANCE) {
            naturalWeather = 'clear'
            weatherStartedAt = now
        }
    } else if (Math.random() < SNOW_CHANCE) {
        naturalWeather = 'snow'
        weatherStartedAt = now
    }

    recompute()
}

function start() {
    recompute()

    if (timers.length > 0) return

    timers = [
        window.setInterval(recompute, CLOCK_CHECK_INTERVAL),
        window.setInterval(rollWeather, WEATHER_CHECK_INTERVAL),
    ]
}

function stop() {
    timers.forEach((timer) => window.clearInterval(timer))
    timers = []
}

function subscribe(callback: () => void) {
    listeners.add(callback)

    if (listeners.size === 1) start()

    return () => {
        listeners.delete(callback)

        if (listeners.size === 0) stop()
    }
}

const getSnapshot = () => world
const getServerSnapshot = () => SERVER_WORLD

export function useWorld(): World {
    return useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    )
}

/*
 * Pengujian lewat console browser:
 * window.momoWorld.set({ hour: 22, weather: 'snow' })
 *
 * Kembali ke jam dan cuaca otomatis:
 * window.momoWorld.set({ hour: null, weather: null })
 */
export function setWorldOverride(
    options: { hour?: number | null; weather?: Weather | null },
) {
    if ('hour' in options) {
        hourOverride = options.hour ?? null
    }

    if ('weather' in options) {
        weatherOverride = options.weather ?? null
    }

    recompute()
}

if (typeof window !== 'undefined') {
    ; (
        window as unknown as {
            momoWorld?: { set: typeof setWorldOverride }
        }
    ).momoWorld = {
        set: setWorldOverride,
    }
}
