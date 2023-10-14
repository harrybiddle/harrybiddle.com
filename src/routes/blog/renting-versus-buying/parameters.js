import { writable } from 'svelte/store'

let allStores = []

export function localStorageStore(key, initial, _func) {
    const func = _func ? _func : x => x
    const localStorageDefined = typeof localStorage !== 'undefined';
    const value = (localStorageDefined ? localStorage.getItem(key) : null) || initial;
    const store = writable(value);
    store.initialValue = initial;
    if (localStorageDefined) {
        store.subscribe(value => localStorage.setItem(key, func(value)));
    }
    allStores.push(store);
    return store;
}

export function resetParametersToDefaults() {
    allStores.forEach(store => store.set(store.initialValue))
}
