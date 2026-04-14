# VD Industry — Portfolio & Suivi Vinted Pro

Portfolio web personnel + application de suivi de bénéfices pour reseller Vinted.

## Stack

- **Framework** : Next.js 14 (App Router)
- **Styles** : Tailwind CSS + composants custom
- **Base de données** : SQLite via Prisma ORM
- **Charts** : Recharts
- **Animations** : Framer Motion

## Installation & lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Générer le client Prisma
npx prisma generate

# 3. Créer la base de données
npx prisma db push

# 4. Insérer les données de départ
npx prisma db seed

# 5. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
VDIndustry/
├── app/
│   ├── page.tsx              → Portfolio (/)
│   ├── app/
│   │   ├── page.tsx          → Dashboard (/app)
│   │   ├── ventes/           → Tableau des articles (/app/ventes)
│   │   └── parametres/       → Paramètres (/app/parametres)
│   └── api/
│       ├── articles/         → CRUD articles
│       ├── upload/           → Upload images
│       ├── parametres/       → GET/PUT paramètres
│       └── stats/            → KPIs agrégés
├── components/
│   ├── portfolio/            → Sections du portfolio
│   ├── app/                  → Composants de l'app
│   └── ui/                   → Composants UI réutilisables
├── lib/
│   ├── prisma.ts             → Client Prisma singleton
│   └── utils.ts              → Utilitaires (cn, formatCurrency…)
├── prisma/
│   ├── schema.prisma         → Schéma BDD
│   └── seed.ts               → Données initiales
└── public/
    ├── me.jpg                → Ta photo (à ajouter)
    └── uploads/              → Images uploadées
```

## Photo de profil

Placer ta photo à `public/me.jpg` pour qu'elle apparaisse sur le portfolio.

## Variables d'environnement

```env
DATABASE_URL="file:./dev.db"
```
