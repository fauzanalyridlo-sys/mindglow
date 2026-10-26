import { useSyncExternalStore } from 'react'

export type Phase = 'dawn' | 'day' | 'dusk' | 'night'
export type Weather = 'clear' | 'rain' | 'snow'
export type World = { hour: number; phase: Phase; weather: Weather }

/* Nilai awal untuk server render (supaya hidrasi tidak bentrok) */
const SERVER_WORLD: World = { hour: 12, phase: 'day', weather: 'clear' }

export function phaseOf(hour: number): Phase {
    if (hour >= 5 && hour < 7) return 'dawn'
    if (hour >= 7 && hour < 17) return 'day'
    if (hour >= 17 && hour < 19) return 'dusk'
    return 'night'
}

let world: World = SERVER_WORLD
let naturalWeather: Weather = 'clear'
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
    const weather = weatherOverride ?? naturalWeather
    const phase = phaseOf(hour)
    if (hour === world.hour && weather === world.weather && phase === world.phase) return
    world = { hour, phase, weather }
    listeners.forEach((l) => l())
}

function rollWeather() {
    const r = Math.random()
    if (naturalWeather === 'clear') {
        if (r < 0.14) naturalWeather = 'rain'
        else if (r < 0.2) naturalWeather = 'snow'
    } else if (r < 0.4) {
        naturalWeather = 'clear'
    }
    recompute()
}

function start() {
    recompute()
    timers = [
        window.setInterval(recompute, 30_000),
        window.setInterval(rollWeather, 45_000),
    ]
}

function stop() {
    timers.forEach((t) => window.clearInterval(t))
    timers = []
}

function subscribe(cb: () => void) {
    listeners.add(cb)
    if (listeners.size === 1) start()
    return () => {
        listeners.delete(cb)
        if (listeners.size === 0) stop()
    }
}

const getSnapshot = () => world
const getServerSnapshot = () => SERVER_WORLD

export function useWorld(): World {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/* Untuk testing lewat console: window.momoWorld.set({ hour: 22, weather: 'rain' }) */
export function setWorldOverride(o: { hour?: number | null; weather?: Weather | null }) {
    if ('hour' in o) hourOverride = o.hour ?? null
    if ('weather' in o) weatherOverride = o.weather ?? null
    recompute()
}

if (typeof window !== 'undefined') {
    ; (window as unknown as { momoWorld?: { set: typeof setWorldOverride } }).momoWorld = {
        set: setWorldOverride,
    }
}