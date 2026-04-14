-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "dateAchat" TIMESTAMP(3) NOT NULL,
    "prixAchat" DOUBLE PRECISION NOT NULL,
    "fraisDivers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prixVente" DOUBLE PRECISION,
    "statut" TEXT NOT NULL DEFAULT 'En stock',
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parametre" (
    "id" SERIAL NOT NULL,
    "seuilOrange" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "margeCible" DOUBLE PRECISION NOT NULL DEFAULT 0.3,

    CONSTRAINT "Parametre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancesParams" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nom1" TEXT NOT NULL DEFAULT 'Valentin',
    "nom2" TEXT NOT NULL DEFAULT 'Clara',
    "soldeDepart" DOUBLE PRECISION NOT NULL DEFAULT 23000,
    "objectifEpargne" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "nbMoisSecurite" INTEGER NOT NULL DEFAULT 6,
    "anneeRef" INTEGER NOT NULL DEFAULT 2026,
    "revenu1Projection" DOUBLE PRECISION NOT NULL DEFAULT 2332,
    "revenu2Projection" DOUBLE PRECISION NOT NULL DEFAULT 436,

    CONSTRAINT "FinancesParams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancesCharge" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'fixe',

    CONSTRAINT "FinancesCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancesMois" (
    "id" SERIAL NOT NULL,
    "annee" INTEGER NOT NULL,
    "mois" INTEGER NOT NULL,
    "revenu1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenu2" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "FinancesMois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestETF" (
    "id" SERIAL NOT NULL,
    "isin" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nomCourt" TEXT NOT NULL,
    "ticker" TEXT NOT NULL DEFAULT '',
    "couleur" TEXT NOT NULL DEFAULT '#10b981',

    CONSTRAINT "InvestETF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestTransaction" (
    "id" SERIAL NOT NULL,
    "etfId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'achat',
    "quantite" DOUBLE PRECISION NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestPlan" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "montantS1" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "montantS2" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "montantS3" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "montantS4" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "partsEmergS4" INTEGER NOT NULL DEFAULT 2,
    "partsStorxxS4" INTEGER NOT NULL DEFAULT 2,
    "cycleWeek" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InvestPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessProfile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "objectifPas" INTEGER NOT NULL DEFAULT 10000,
    "objectifCal" INTEGER NOT NULL DEFAULT 2500,
    "objectifProteines" INTEGER NOT NULL DEFAULT 150,
    "objectifGlucides" INTEGER NOT NULL DEFAULT 250,
    "objectifLipides" INTEGER NOT NULL DEFAULT 80,
    "poids" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "taille" INTEGER NOT NULL DEFAULT 178,
    "age" INTEGER NOT NULL DEFAULT 22,

    CONSTRAINT "FitnessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessSeance" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'musculation',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duree" INTEGER NOT NULL DEFAULT 60,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitnessSeance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessExercice" (
    "id" SERIAL NOT NULL,
    "seanceId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "muscle" TEXT NOT NULL DEFAULT 'pectoraux',
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FitnessExercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessSerie" (
    "id" SERIAL NOT NULL,
    "exerciceId" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "poids" DOUBLE PRECISION NOT NULL,
    "numero" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "FitnessSerie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessJour" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pas" INTEGER NOT NULL DEFAULT 0,
    "poids" DOUBLE PRECISION,

    CONSTRAINT "FitnessJour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessRepas" (
    "id" SERIAL NOT NULL,
    "jourId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "proteines" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "glucides" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lipides" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moment" TEXT NOT NULL DEFAULT 'dejeuner',

    CONSTRAINT "FitnessRepas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_articleId_key" ON "Article"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancesMois_annee_mois_key" ON "FinancesMois"("annee", "mois");

-- CreateIndex
CREATE UNIQUE INDEX "InvestETF_isin_key" ON "InvestETF"("isin");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessJour_date_key" ON "FitnessJour"("date");

-- AddForeignKey
ALTER TABLE "InvestTransaction" ADD CONSTRAINT "InvestTransaction_etfId_fkey" FOREIGN KEY ("etfId") REFERENCES "InvestETF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessExercice" ADD CONSTRAINT "FitnessExercice_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "FitnessSeance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessSerie" ADD CONSTRAINT "FitnessSerie_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "FitnessExercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessRepas" ADD CONSTRAINT "FitnessRepas_jourId_fkey" FOREIGN KEY ("jourId") REFERENCES "FitnessJour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.7.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
