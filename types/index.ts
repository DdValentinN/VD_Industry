export interface Article {
  id: string
  articleId: string
  nom: string
  categorie: string
  dateAchat: string
  prixAchat: number
  fraisDivers: number
  prixVente: number | null
  statut: string
  notes: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Parametre {
  id: number
  seuilOrange: number
  margeCible: number
}

export interface BeneficeParMois {
  mois: string
  benefice: number
  ca: number
}

export interface RepartitionCategorie {
  categorie: string
  count: number
  benefice: number
}

// ── Finances Couple ──────────────────────────────────────────────────────────

export interface FinancesParams {
  id: number
  nom1: string
  nom2: string
  soldeDepart: number
  objectifEpargne: number
  nbMoisSecurite: number
  anneeRef: number
  revenu1Projection: number
  revenu2Projection: number
}

export interface FinancesCharge {
  id: number
  nom: string
  montant: number
  type: 'fixe' | 'variable'
}

export interface FinancesMois {
  id: number
  annee: number
  mois: number
  revenu1: number
  revenu2: number
}

export interface FinancesMoisComputed {
  mois: number
  nom: string
  revenu1: number
  revenu2: number
  revenuTotal: number
  chargesFixes: number
  chargesVariables: number
  chargesTotales: number
  epargne: number
  solde: number
  tauxEpargne: number
  poids1: number
  poids2: number
  hasData: boolean
}

export interface FinancesProjection {
  annee: number
  revenuAnnuel: number
  chargesAnnuelles: number
  epargnAnnuelle: number
  tauxEpargne: number
  soldeFin: number
  moisVerts: number
}

// ── Investissements PEA ───────────────────────────────────────────────────────

export interface InvestETF {
  id: number
  isin: string
  nom: string
  nomCourt: string
  ticker: string
  couleur: string
}

export interface InvestTransaction {
  id: number
  etfId: number
  type: 'achat' | 'vente'
  quantite: number
  prix: number
  date: string
  notes: string | null
  createdAt: string
  etf?: InvestETF
}

export interface InvestPlan {
  id: number
  montantS1: number
  montantS2: number
  montantS3: number
  montantS4: number
  partsEmergS4: number
  partsStorxxS4: number
  cycleWeek: number
}

export interface ETFQuote {
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  currency: string
  dayHigh: number
  dayLow: number
  marketState: string
}

export interface PortfolioETF extends InvestETF {
  quantite: number
  prixMoyen: number
  valeurInvestie: number
  valeurActuelle: number
  plusValue: number
  performance: number
  quote: ETFQuote | null
  transactions: InvestTransaction[]
}

export interface HistoryPoint {
  date: string
  prix: number
}

// ── Fitness ───────────────────────────────────────────────────────────────────

export interface FitnessProfile {
  id: number
  objectifPas: number
  objectifCal: number
  objectifProteines: number
  objectifGlucides: number
  objectifLipides: number
  poids: number
  taille: number
  age: number
}

export interface FitnessSerie {
  id: number
  exerciceId: number
  repetitions: number
  poids: number
  numero: number
}

export interface FitnessExercice {
  id: number
  seanceId: number
  nom: string
  muscle: string
  ordre: number
  series: FitnessSerie[]
}

export interface FitnessSeance {
  id: number
  nom: string
  type: string
  date: string
  duree: number
  notes: string | null
  exercices: FitnessExercice[]
  createdAt: string
}

export interface FitnessRepas {
  id: number
  jourId: number
  nom: string
  calories: number
  proteines: number
  glucides: number
  lipides: number
  moment: string
}

export interface FitnessJour {
  id: number
  date: string
  pas: number
  poids: number | null
  repas: FitnessRepas[]
}

export type MuscleGroup = 'pectoraux' | 'dos' | 'epaules' | 'biceps' | 'triceps' | 'jambes' | 'abdos' | 'fessiers' | 'cardio'
export type SeanceType = 'musculation' | 'cardio' | 'full_body' | 'hiit' | 'mobilite'
export type MomentRepas = 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation'

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface Stats {
  chiffreAffaires: number
  beneficeNet: number
  margeMoyenne: number
  nbVendus: number
  nbEnStock: number
  beneficeParMois: BeneficeParMois[]
  repartitionCategorie: RepartitionCategorie[]
  dernieresVentes: Article[]
}
