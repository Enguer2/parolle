# parolle

# 📦 Prisma & Base de données – Guide rapide

Ce dossier contient la configuration Prisma, les migrations et les données initiales
utilisées par le projet.  
La base de données utilisée est PostgreSQL hébergée sur **Supabase**.

---

## ⚙️ 1. Prérequis

- Node.js installé
- Accès à ta base Supabase (URL + clé) → stockés dans `.env` :
```env
DATABASE_URL="postgresql://user:password@host:5432/postgres"
