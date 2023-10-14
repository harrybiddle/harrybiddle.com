// src/stores/enabled.ts
import { writable } from 'svelte/store'

export const maxYears = writable((typeof localStorage !== 'undefined') ? localStorage.getItem("maxYears") || 30 : null)

if (typeof localStorage !== 'undefined') {
    maxYears.subscribe((value) => localStorage.setItem("maxYears", value))
}
