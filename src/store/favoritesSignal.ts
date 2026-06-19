import { signal, effect } from "@preact/signals-react";

// 1. Initialize from localStorage (if it exists)
const storedFavs = typeof window !== 'undefined' ? localStorage.getItem("wc_favorites") : null;
const initialFavs: string[] = storedFavs ? JSON.parse(storedFavs) : [];

// 2. Create the global Signal
export const favoritesSignal = signal<string[]>(initialFavs);

// 3. Effect: Automatically sync to localStorage whenever the signal changes
effect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("wc_favorites", JSON.stringify(favoritesSignal.value));
  }
});

// Helper action
export const toggleFavorite = (teamName: string) => {
  const current = favoritesSignal.value;
  if (current.includes(teamName)) {
    favoritesSignal.value = current.filter((t) => t !== teamName);
  } else {
    favoritesSignal.value = [...current, teamName];
  }
};

export const clearFavorites = () => {
  favoritesSignal.value = [];
};
