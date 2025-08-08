
# Parolle — Wordle corsu (starter)

Stack : React + Vite + TypeScript + Tailwind + React Router + Zustand.

## Démarrer

```bash
pnpm i # ou npm i / yarn
pnpm dev
```

## Pages

- `/` : Jeu (Board + Keyboard)
- `/how-to-play` : Règles
- `/stats` : Statistiques
- `/settings` : Réglages

> Tu peux aussi faire **une seule page** et garder Stats/Règles/Réglages en **modales** si tu préfères.

## Prochaines étapes

- Remplacer `TARGET` par un mot du jour servi par une API (serverless).
- Intégrer une wordlist corse (5 lettres) et la validation côté serveur.
- Ajout mode daltonien, sons, partage des résultats.
- PWA (offline) + analytics respectueux (Plausible).
