import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const D = (s: string) => new Date(s)

// Groupes de dates réalistes basés sur l'ordre des articles
const MAR_A = D('2026-03-07')  // A-006  → A-020  (début mars)
const MAR_B = D('2026-03-13')  // A-021  → A-035  (mi mars)
const MAR_C = D('2026-03-19')  // A-036  → A-050  (fin mi mars)
const MAR_D = D('2026-03-26')  // A-051  → A-070  (fin mars)
const APR_A = D('2026-04-04')  // A-071  → A-078  (début avril)
const APR_B = D('2026-04-09')  // A-079  → A-085  (mi avril)

async function main() {
  await prisma.parametre.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, seuilOrange: 2, margeCible: 0.3 },
  })

  // ── Finances Couple ───────────────────────────────────────────────────────

  await prisma.financesParams.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nom1: 'Valentin',
      nom2: 'Clara',
      soldeDepart: 23000,
      objectifEpargne: 500,
      nbMoisSecurite: 6,
      anneeRef: 2026,
      revenu1Projection: 2332,
      revenu2Projection: 436,
    },
  })

  // Charges (only insert if none exist)
  const existingCharges = await prisma.financesCharge.count()
  if (existingCharges === 0) {
    await prisma.financesCharge.createMany({
      data: [
        // Fixes — total: 880€/mois
        { nom: 'Loyer', montant: 630, type: 'fixe' },
        { nom: 'Assurances', montant: 114, type: 'fixe' },
        { nom: 'Parking', montant: 45, type: 'fixe' },
        { nom: 'Abonnements', montant: 45, type: 'fixe' },
        { nom: 'Canal', montant: 20, type: 'fixe' },
        { nom: 'Salle de sport', montant: 26, type: 'fixe' },
        // Variables — total: 610€/mois
        { nom: 'Courses', montant: 400, type: 'variable' },
        { nom: 'Essence', montant: 110, type: 'variable' },
        { nom: 'Shopping & divers', montant: 100, type: 'variable' },
      ],
    })
  }

  // Monthly entries for 2026 (from Excel analysis)
  // Jan–Aug: Valentin 1932, Clara 436 → total 2368
  // Sep: Valentin 2132, Clara 436 → total 2568
  // Oct–Dec: Valentin 2332, Clara 436 → total 2768
  const mois2026 = [
    { annee: 2026, mois: 1,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 2,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 3,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 4,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 5,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 6,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 7,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 8,  revenu1: 1932, revenu2: 436 },
    { annee: 2026, mois: 9,  revenu1: 2132, revenu2: 436 },
    { annee: 2026, mois: 10, revenu1: 2332, revenu2: 436 },
    { annee: 2026, mois: 11, revenu1: 2332, revenu2: 436 },
    { annee: 2026, mois: 12, revenu1: 2332, revenu2: 436 },
  ]

  for (const m of mois2026) {
    await prisma.financesMois.upsert({
      where: { annee_mois: { annee: m.annee, mois: m.mois } },
      update: {},
      create: m,
    })
  }

  console.log('✅ Finances couple seedées (params + 9 charges + 12 mois 2026)')

  // ── Investissements PEA ───────────────────────────────────────────────────

  // Only seed if no ETFs exist yet
  const existingETFs = await prisma.investETF.count()
  if (existingETFs === 0) {
    const msci = await prisma.investETF.create({
      data: {
        isin: 'IE0002XZSHO1',
        nom: 'MSCI World SWAP PEA',
        nomCourt: 'MSCI World',
        ticker: '',
        couleur: '#10b981',
      },
    })
    const stoxx = await prisma.investETF.create({
      data: {
        isin: 'FR0011550193',
        nom: 'Easy STOXX Europe 600',
        nomCourt: 'STOXX 600',
        ticker: '',
        couleur: '#38bdf8',
      },
    })
    const emerg = await prisma.investETF.create({
      data: {
        isin: 'FR0013412020',
        nom: 'PEA Emergent ESG Transition',
        nomCourt: 'PEA Emergent',
        ticker: '',
        couleur: '#a78bfa',
      },
    })

    // Initial positions as transactions
    await prisma.investTransaction.createMany({
      data: [
        // MSCI World: 40 parts @ 6.1805€ avg
        { etfId: msci.id, type: 'achat', quantite: 40, prix: 6.1805, date: new Date('2026-01-01'), notes: 'Position initiale' },
        // STOXX 600: 1 part @ 19.272€
        { etfId: stoxx.id, type: 'achat', quantite: 1, prix: 19.272, date: new Date('2026-01-01'), notes: 'Position initiale' },
        // PEA Emergent: 1 part @ 31.1€
        { etfId: emerg.id, type: 'achat', quantite: 1, prix: 31.1, date: new Date('2026-01-01'), notes: 'Position initiale' },
      ],
    })

    // Invest plan (default 4-week cycle)
    await prisma.investPlan.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, montantS1: 100, montantS2: 100, montantS3: 100, montantS4: 150, partsEmergS4: 2, partsStorxxS4: 2, cycleWeek: 1 },
    })

    console.log('✅ Investissements seedés (3 ETFs + positions initiales + plan)')
  }

  // ── Fitness ───────────────────────────────────────────────────────────────

  const existingSeances = await prisma.fitnessSeance.count()
  if (existingSeances === 0) {
    await prisma.fitnessProfile.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, objectifPas: 10000, objectifCal: 2500, objectifProteines: 180, objectifGlucides: 250, objectifLipides: 70, poids: 76.5, taille: 178, age: 22 },
    })

    // Séances exemple
    const push = await prisma.fitnessSeance.create({
      data: {
        nom: 'Push A',
        type: 'musculation',
        date: new Date('2026-04-07'),
        duree: 75,
        notes: 'Bonne séance, PR sur développé couché',
        exercices: {
          create: [
            {
              nom: 'Développé couché',
              muscle: 'pectoraux',
              ordre: 0,
              series: { create: [
                { repetitions: 8, poids: 80, numero: 1 },
                { repetitions: 8, poids: 80, numero: 2 },
                { repetitions: 7, poids: 80, numero: 3 },
                { repetitions: 6, poids: 80, numero: 4 },
              ]},
            },
            {
              nom: 'Développé incliné haltères',
              muscle: 'pectoraux',
              ordre: 1,
              series: { create: [
                { repetitions: 10, poids: 28, numero: 1 },
                { repetitions: 10, poids: 28, numero: 2 },
                { repetitions: 9,  poids: 28, numero: 3 },
              ]},
            },
            {
              nom: 'Écarté poulie haute',
              muscle: 'pectoraux',
              ordre: 2,
              series: { create: [
                { repetitions: 12, poids: 15, numero: 1 },
                { repetitions: 12, poids: 15, numero: 2 },
                { repetitions: 12, poids: 15, numero: 3 },
              ]},
            },
            {
              nom: 'Développé militaire',
              muscle: 'epaules',
              ordre: 3,
              series: { create: [
                { repetitions: 8, poids: 50, numero: 1 },
                { repetitions: 8, poids: 50, numero: 2 },
                { repetitions: 7, poids: 50, numero: 3 },
              ]},
            },
            {
              nom: 'Triceps poulie haute',
              muscle: 'triceps',
              ordre: 4,
              series: { create: [
                { repetitions: 12, poids: 25, numero: 1 },
                { repetitions: 12, poids: 25, numero: 2 },
                { repetitions: 12, poids: 25, numero: 3 },
              ]},
            },
          ],
        },
      },
    })

    await prisma.fitnessSeance.create({
      data: {
        nom: 'Pull A',
        type: 'musculation',
        date: new Date('2026-04-09'),
        duree: 70,
        exercices: {
          create: [
            {
              nom: 'Tractions',
              muscle: 'dos',
              ordre: 0,
              series: { create: [
                { repetitions: 8, poids: 0, numero: 1 },
                { repetitions: 7, poids: 0, numero: 2 },
                { repetitions: 6, poids: 0, numero: 3 },
              ]},
            },
            {
              nom: 'Rowing barre',
              muscle: 'dos',
              ordre: 1,
              series: { create: [
                { repetitions: 8, poids: 70, numero: 1 },
                { repetitions: 8, poids: 70, numero: 2 },
                { repetitions: 8, poids: 70, numero: 3 },
              ]},
            },
            {
              nom: 'Curl barre',
              muscle: 'biceps',
              ordre: 2,
              series: { create: [
                { repetitions: 10, poids: 35, numero: 1 },
                { repetitions: 10, poids: 35, numero: 2 },
                { repetitions: 9,  poids: 35, numero: 3 },
              ]},
            },
            {
              nom: 'Curl marteau',
              muscle: 'biceps',
              ordre: 3,
              series: { create: [
                { repetitions: 12, poids: 16, numero: 1 },
                { repetitions: 12, poids: 16, numero: 2 },
              ]},
            },
          ],
        },
      },
    })

    await prisma.fitnessSeance.create({
      data: {
        nom: 'Leg Day',
        type: 'musculation',
        date: new Date('2026-04-11'),
        duree: 80,
        exercices: {
          create: [
            {
              nom: 'Squat barre',
              muscle: 'jambes',
              ordre: 0,
              series: { create: [
                { repetitions: 6, poids: 100, numero: 1 },
                { repetitions: 6, poids: 100, numero: 2 },
                { repetitions: 5, poids: 100, numero: 3 },
                { repetitions: 5, poids: 100, numero: 4 },
              ]},
            },
            {
              nom: 'Presse à cuisses',
              muscle: 'jambes',
              ordre: 1,
              series: { create: [
                { repetitions: 12, poids: 140, numero: 1 },
                { repetitions: 12, poids: 140, numero: 2 },
                { repetitions: 10, poids: 140, numero: 3 },
              ]},
            },
            {
              nom: 'Fentes haltères',
              muscle: 'jambes',
              ordre: 2,
              series: { create: [
                { repetitions: 10, poids: 24, numero: 1 },
                { repetitions: 10, poids: 24, numero: 2 },
              ]},
            },
            {
              nom: 'Hip thrust',
              muscle: 'fessiers',
              ordre: 3,
              series: { create: [
                { repetitions: 12, poids: 80, numero: 1 },
                { repetitions: 12, poids: 80, numero: 2 },
                { repetitions: 12, poids: 80, numero: 3 },
              ]},
            },
          ],
        },
      },
    })

    // Quelques jours avec data
    const joursSeed = [
      { date: '2026-04-07', pas: 8400, poids: 76.5 },
      { date: '2026-04-08', pas: 11200, poids: null },
      { date: '2026-04-09', pas: 9800, poids: 76.2 },
      { date: '2026-04-10', pas: 6200, poids: null },
      { date: '2026-04-11', pas: 10500, poids: 76.3 },
      { date: '2026-04-12', pas: 7300, poids: 76.0 },
      { date: '2026-04-13', pas: 9100, poids: null },
      { date: '2026-04-14', pas: 4200, poids: 76.1 },
    ]

    for (const j of joursSeed) {
      const jour = await prisma.fitnessJour.create({
        data: { date: new Date(j.date), pas: j.pas, poids: j.poids },
      })

      if (j.date === '2026-04-14') {
        await prisma.fitnessRepas.createMany({
          data: [
            { jourId: jour.id, nom: 'Flocons d\'avoine + banane', calories: 380, proteines: 12, glucides: 68, lipides: 6, moment: 'petit_dejeuner' },
            { jourId: jour.id, nom: 'Poulet riz légumes', calories: 550, proteines: 52, glucides: 58, lipides: 10, moment: 'dejeuner' },
            { jourId: jour.id, nom: 'Whey + fruit', calories: 180, proteines: 30, glucides: 12, lipides: 2, moment: 'collation' },
          ],
        })
      }
    }

    console.log('✅ Fitness seedé (profil + 3 séances + jours + repas)')
  }

  await prisma.article.deleteMany({})

  const articles = [
    // ── Dates explicites (conservées telles quelles) ────────────────────
    { articleId: 'A-001', nom: 'Pantalon de jogging PXP',             categorie: 'Vêtements', dateAchat: D('2026-03-05'), prixAchat: 0,     fraisDivers: 0, prixVente: 5,     statut: 'Vendu'    },
    { articleId: 'A-002', nom: 'Doudoune puffer',                     categorie: 'Vêtements', dateAchat: D('2026-03-08'), prixAchat: 20,    fraisDivers: 0, prixVente: 25,    statut: 'Vendu'    },
    { articleId: 'A-003', nom: 'Ensemble mbappe',                     categorie: 'Vêtements', dateAchat: D('2026-03-10'), prixAchat: 10,    fraisDivers: 0, prixVente: 13,    statut: 'Vendu'    },
    { articleId: 'A-004', nom: 'Chemise burberry',                    categorie: 'Vêtements', dateAchat: D('2026-04-13'), prixAchat: 6.84,  fraisDivers: 0, prixVente: 32,    statut: 'Vendu'    },
    { articleId: 'A-005', nom: 'Pull blanc cœur',                     categorie: 'Vêtements', dateAchat: D('2026-02-25'), prixAchat: 10,    fraisDivers: 0, prixVente: 22,    statut: 'Vendu'    },

    // ── Début mars (A-006 → A-020) ──────────────────────────────────────
    { articleId: 'A-006', nom: 'Pull RL vintage rouge',               categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 0,     fraisDivers: 0, prixVente: 32,    statut: 'Vendu'    },
    { articleId: 'A-007', nom: 'Pull torsadé RL',                     categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 35.19, fraisDivers: 0, prixVente: 38.60, statut: 'Vendu'    },
    { articleId: 'A-008', nom: 'Ensemble sweat jogging',              categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 0,     fraisDivers: 0, prixVente: 12,    statut: 'Vendu'    },
    { articleId: 'A-009', nom: 'Pull lacoste rose',                   categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 10.50, fraisDivers: 0, prixVente: 18,    statut: 'Vendu'    },
    { articleId: 'A-010', nom: 'Cardigan lacoste',                    categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 10.50, fraisDivers: 0, prixVente: 17,    statut: 'Vendu'    },
    { articleId: 'A-011', nom: 'Polo RL jaune',                       categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 5.44,  fraisDivers: 0, prixVente: 11,    statut: 'Vendu'    },
    { articleId: 'A-012', nom: 'Sweat zipé zara',                     categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 8.90,  fraisDivers: 0, prixVente: 20,    statut: 'Vendu'    },
    { articleId: 'A-013', nom: 'Chemise rose RL',                     categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 9.88,  fraisDivers: 0, prixVente: 13,    statut: 'Vendu'    },
    { articleId: 'A-014', nom: 'Chemise HG Boss',                     categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 4.91,  fraisDivers: 0, prixVente: 17.50, statut: 'Vendu'    },
    { articleId: 'A-015', nom: 'Cardigan lacoste vintage',            categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 10.50, fraisDivers: 0, prixVente: 27,    statut: 'Vendu'    },
    { articleId: 'A-016', nom: 'Chemise manche courte RL',            categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 7.02,  fraisDivers: 0, prixVente: 14,    statut: 'Vendu'    },
    { articleId: 'A-017', nom: 'Chemise vintage blanche',             categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 1.10,  fraisDivers: 0, prixVente: 7.20,  statut: 'Vendu'    },
    { articleId: 'A-018', nom: 'Chemise a carreaux RL',               categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 14.08, fraisDivers: 0, prixVente: 18,    statut: 'Vendu'    },
    { articleId: 'A-019', nom: 'Chemise vintage beige',               categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 1.10,  fraisDivers: 0, prixVente: 8,     statut: 'Vendu'    },
    { articleId: 'A-020', nom: 'Pull lacoste tachés',                 categorie: 'Vêtements', dateAchat: MAR_A, prixAchat: 21,    fraisDivers: 0, prixVente: 5.50,  statut: 'Vendu'    },

    // ── Mi-mars (A-021 → A-035) ─────────────────────────────────────────
    { articleId: 'A-021', nom: 'Pull nike 1/4 zip',                   categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 5.63,  fraisDivers: 0, prixVente: 10,    statut: 'Vendu'    },
    { articleId: 'A-022', nom: 'Polo RL bleu',                        categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 8.78,  fraisDivers: 0, prixVente: 12,    statut: 'Vendu'    },
    { articleId: 'A-023', nom: 'Veste nike velours',                  categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 8.97,  fraisDivers: 0, prixVente: 30,    statut: 'Vendu'    },
    { articleId: 'A-024', nom: 'Pull lacoste marron',                 categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 10.50, fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-025', nom: 'Chemise a carreaux RL (2)',           categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 7.02,  fraisDivers: 0, prixVente: 12,    statut: 'Vendu'    },
    { articleId: 'A-026', nom: 'Haut torsadé jaune femme',            categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 13.14, fraisDivers: 0, prixVente: 19.50, statut: 'Vendu'    },
    { articleId: 'A-027', nom: 'Chemise HG Boss XL',                  categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 4.91,  fraisDivers: 0, prixVente: 15,    statut: 'Vendu'    },
    { articleId: 'A-028', nom: 'Costume noir',                        categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 12.86, fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-029', nom: 'Polo tommy blanc',                    categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 7.31,  fraisDivers: 0, prixVente: 9.50,  statut: 'Vendu'    },
    { articleId: 'A-030', nom: 'Chemise vintage blanche ML',          categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 1.10,  fraisDivers: 0, prixVente: 8,     statut: 'Vendu'    },
    { articleId: 'A-031', nom: 'Chemise vintage (1)',                 categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 1.10,  fraisDivers: 0, prixVente: 4.50,  statut: 'Vendu'    },
    { articleId: 'A-032', nom: 'Chemise vintage (2)',                 categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 1.10,  fraisDivers: 0, prixVente: 4.50,  statut: 'Vendu'    },
    { articleId: 'A-033', nom: 'Chemise vintage (3)',                 categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 1.10,  fraisDivers: 0, prixVente: 4.50,  statut: 'Vendu'    },
    { articleId: 'A-034', nom: 'Chemise vintage (4)',                 categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 1.10,  fraisDivers: 0, prixVente: 4.50,  statut: 'Vendu'    },
    { articleId: 'A-035', nom: 'Chemise vintage Marin',               categorie: 'Vêtements', dateAchat: MAR_B, prixAchat: 1.10,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },

    // ── Fin mi-mars (A-036 → A-050) ─────────────────────────────────────
    { articleId: 'A-036', nom: 'Chemise vintage rouge',               categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 1.10,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-037', nom: 'Short gymshark rouge S',              categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 7.83,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-038', nom: 'Legging gymshark bleu foncé S',       categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 7.31,  fraisDivers: 0, prixVente: 12,    statut: 'Vendu'    },
    { articleId: 'A-039', nom: 'Legging gymshark rose XS',            categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 2.36,  fraisDivers: 0, prixVente: 8,     statut: 'Vendu'    },
    { articleId: 'A-040', nom: 'Legging gymshark bleu S taché',       categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 2.35,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-041', nom: 'Short gymshark bordeaux XS',          categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 7.73,  fraisDivers: 0, prixVente: 14,    statut: 'Vendu'    },
    { articleId: 'A-042', nom: 'Legging gymshark bleu bizarre S',     categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 6.68,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-043', nom: 'Legging gymshark violet',             categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 3.08,  fraisDivers: 0, prixVente: 8,     statut: 'Vendu'    },
    { articleId: 'A-044', nom: 'Legging gymshark gris',               categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 3.08,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-045', nom: 'Legging gymshark gris et violet',     categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 3.08,  fraisDivers: 0, prixVente: 8,     statut: 'Vendu'    },
    { articleId: 'A-046', nom: 'Legging gymshark noir',               categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 3.08,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-047', nom: 'Short gymshark XS bordeaux',          categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 5.44,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-048', nom: 'Short gymshark XS gris',              categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 5.44,  fraisDivers: 0, prixVente: 7,     statut: 'Vendu'    },
    { articleId: 'A-049', nom: 'Gilet nike noir S',                   categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 7.78,  fraisDivers: 0, prixVente: 18,    statut: 'Vendu'    },
    { articleId: 'A-050', nom: 'Pull zara gris blanc M',              categorie: 'Vêtements', dateAchat: MAR_C, prixAchat: 5.68,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },

    // ── Fin mars (A-051 → A-070) ────────────────────────────────────────
    { articleId: 'A-051', nom: 'Doudoune zara',                       categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 6.94,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-052', nom: 'Jogging gymshark beige',              categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 7.73,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-053', nom: 'Veste en cuir zara',                  categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 8.13,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-054', nom: 'Pull tommy',                          categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: 16,    statut: 'Vendu'    },
    { articleId: 'A-055', nom: 'Jean stradivarius beige 34',          categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: 10,    statut: 'Vendu'    },
    { articleId: 'A-056', nom: 'Jean Pull&Bear marron 34',            categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-057', nom: 'Jean bershka 32',                     categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-058', nom: 'Pantalon noir Pull&Bear S',           categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-059', nom: 'Jean H&M 34',                        categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-060', nom: 'Pantalon cuir S',                     categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-061', nom: 'Jean calzedonia M',                   categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-062', nom: 'Jean fermeture niqué',               categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-063', nom: 'Jean vert leopard',                   categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 2.49,  fraisDivers: 0, prixVente: 4,     statut: 'Vendu'    },
    { articleId: 'A-064', nom: 'Polo RL violet',                      categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 5.44,  fraisDivers: 0, prixVente: 9.50,  statut: 'Vendu'    },
    { articleId: 'A-065', nom: 'Brassière nike',                      categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 3.28,  fraisDivers: 0, prixVente: 7.65,  statut: 'Vendu'    },
    { articleId: 'A-066', nom: 'Pull nike taché',                     categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 3.28,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-067', nom: 'Jogging nike gris',                   categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 3.28,  fraisDivers: 0, prixVente: 7.65,  statut: 'Vendu'    },
    { articleId: 'A-068', nom: 'Pull RL gris col v',                  categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 0,     fraisDivers: 0, prixVente: 25,    statut: 'Vendu'    },
    { articleId: 'A-069', nom: 'Pull PXP gris',                       categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 0,     fraisDivers: 0, prixVente: 16,    statut: 'Vendu'    },
    { articleId: 'A-070', nom: 'Polo Hollister L',                    categorie: 'Vêtements', dateAchat: MAR_D, prixAchat: 0,     fraisDivers: 0, prixVente: 9.50,  statut: 'Vendu'    },

    // ── Début avril (A-071 → A-078) ─────────────────────────────────────
    { articleId: 'A-071', nom: 'Hoodie RL gris',                      categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 0,     fraisDivers: 0, prixVente: 30,    statut: 'Vendu'    },
    { articleId: 'A-072', nom: 'Gilet tommy L',                       categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 11.80, fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-073', nom: 'Pull CK M',                           categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 8.88,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-074', nom: 'Hoodie GAP bleu marine XS',           categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 7.78,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-075', nom: 'Hoodie GAP bleu marine M logo rouge', categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 9.83,  fraisDivers: 0, prixVente: 20,    statut: 'Vendu'    },
    { articleId: 'A-076', nom: 'Gilet GAP bleu marine M',             categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 4.90,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-077', nom: 'Hoodie noir Bershka M',               categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 6.68,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-078', nom: 'Hoodie Tommy H bleu XS',              categorie: 'Vêtements', dateAchat: APR_A, prixAchat: 9.71,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },

    // ── Mi-avril (A-079 → A-085) ────────────────────────────────────────
    { articleId: 'A-079', nom: 'Ensemble survet zara',                categorie: 'Vêtements', dateAchat: APR_B, prixAchat: 10.95, fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-080', nom: 'Gilet nike gris S',                   categorie: 'Vêtements', dateAchat: APR_B, prixAchat: 10.98, fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-081', nom: 'Pull Tommy H rose S',                 categorie: 'Vêtements', dateAchat: APR_B, prixAchat: 7.73,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-082', nom: 'Hoodie Boohooman',                    categorie: 'Vêtements', dateAchat: APR_B, prixAchat: 0,     fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-083', nom: 'Hoodie Tommy H bleu XS (2)',          categorie: 'Vêtements', dateAchat: APR_B, prixAchat: 8.12,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-084', nom: 'Hoodie jordan bleu clair XS',         categorie: 'Vêtements', dateAchat: APR_B, prixAchat: 7.73,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
    { articleId: 'A-085', nom: 'Sweat nike L gris',                   categorie: 'Vêtements', dateAchat: APR_B, prixAchat: 6.68,  fraisDivers: 0, prixVente: null,  statut: 'En stock' },
  ]

  await prisma.article.createMany({ data: articles })

  const vendus = articles.filter(a => a.statut === 'Vendu').length
  const enStock = articles.filter(a => a.statut === 'En stock').length
  console.log(`✅ ${articles.length} articles insérés (${vendus} vendus · ${enStock} en stock)`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
