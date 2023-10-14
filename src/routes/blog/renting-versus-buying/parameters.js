import { writable } from 'svelte/store'

// helper function
function localStorageStore(key, initial) {
    const localStorageDefined = typeof localStorage !== 'undefined';

    const value = (localStorageDefined ? localStorage.getItem(key) : null) || initial;
    const store = writable(value);
    store.defaultValue = initial;
    if (localStorageDefined) {
        store.subscribe(value => localStorage.setItem(key, value));
    }
    store.resetToDefaultValue = () => store.set(initial);
    return store;
}

// parameter definitions
export const maxYears = localStorageStore("maxYears", 30);
