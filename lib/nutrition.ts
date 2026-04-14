// ── Base de données nutritionnelle ────────────────────────────────────────────
// Macros pour 100g (ou 100ml pour les liquides)
// Sources : CIQUAL (base officielle ANSES France)

export interface FoodEntry {
  cal: number   // kcal
  prot: number  // g
  gluc: number  // g
  lip: number   // g
  aliases: string[]
  portionStd?: number  // poids standard si l'unité est "1 tranche", "1 œuf", etc.
  portionLabel?: string
}

export const FOOD_DB: Record<string, FoodEntry> = {
  // ── Viandes & Poissons ────────────────────────────────────────────────────
  poulet_grille:     { cal: 165, prot: 31.0, gluc: 0,    lip: 3.6,  aliases: ['poulet', 'poulet grillé', 'blanc de poulet', 'filet poulet', 'poulet cuit', 'escalope poulet', 'poulet rôti', 'poulet vapeur'] },
  dinde_grillee:     { cal: 157, prot: 29.0, gluc: 0,    lip: 3.8,  aliases: ['dinde', 'dinde grillée', 'filet dinde', 'escalope dinde'] },
  boeuf_haché_5:     { cal: 137, prot: 20.0, gluc: 0,    lip: 6.0,  aliases: ['steak haché 5%', 'boeuf haché 5', 'steak 5%', 'viande hachée 5%', 'haché 5%'] },
  boeuf_haché_15:    { cal: 215, prot: 17.0, gluc: 0,    lip: 15.8, aliases: ['steak haché 15%', 'boeuf haché 15', 'steak 15%', 'viande hachée 15%', 'haché 15%', 'steak haché'] },
  boeuf_steak:       { cal: 190, prot: 26.0, gluc: 0,    lip: 9.5,  aliases: ['steak', 'boeuf', 'rumsteck', 'bavette', 'entrecôte'] },
  saumon:            { cal: 208, prot: 20.0, gluc: 0,    lip: 13.4, aliases: ['saumon', 'saumon grillé', 'saumon cuit', 'filet saumon'] },
  saumon_fumé:       { cal: 172, prot: 25.4, gluc: 0,    lip: 7.9,  aliases: ['saumon fumé'] },
  thon_conserve:     { cal: 116, prot: 26.0, gluc: 0,    lip: 0.5,  aliases: ['thon', 'thon en boîte', 'thon conserve', 'thon naturel'] },
  crevettes:         { cal: 99,  prot: 21.0, gluc: 0,    lip: 1.1,  aliases: ['crevettes', 'crevette'] },
  porc_filet:        { cal: 143, prot: 22.2, gluc: 0,    lip: 5.5,  aliases: ['porc', 'filet mignon porc', 'côtelette porc'] },
  jambon_blanc:      { cal: 107, prot: 18.5, gluc: 0.8,  lip: 3.3,  aliases: ['jambon', 'jambon blanc', 'jambon cuit'], portionStd: 30, portionLabel: 'tranche' },
  oeuf_entier:       { cal: 147, prot: 12.6, gluc: 0.8,  lip: 10.2, aliases: ['oeuf', 'œuf', 'oeufs', 'œufs', 'oeuf entier'], portionStd: 60, portionLabel: 'oeuf' },
  blanc_oeuf:        { cal: 47,  prot: 10.9, gluc: 0.7,  lip: 0.2,  aliases: ['blanc oeuf', 'blanc d\'oeuf', 'blanc d\'œuf', 'blancs oeufs'] },

  // ── Produits laitiers & Protéines lait ───────────────────────────────────
  fromage_blanc_0:   { cal: 47,  prot: 7.8,  gluc: 3.7,  lip: 0.1,  aliases: ['fromage blanc 0%', 'fromage blanc maigre'] },
  fromage_blanc_3:   { cal: 65,  prot: 7.2,  gluc: 4.0,  lip: 2.0,  aliases: ['fromage blanc', 'fromage blanc 3%'] },
  yaourt_grec_0:     { cal: 57,  prot: 9.9,  gluc: 3.6,  lip: 0.4,  aliases: ['yaourt grec 0%', 'yogourt grec 0%'] },
  yaourt_grec:       { cal: 133, prot: 9.0,  gluc: 3.6,  lip: 9.1,  aliases: ['yaourt grec', 'yogourt grec'] },
  yaourt_nature:     { cal: 61,  prot: 3.8,  gluc: 4.7,  lip: 2.7,  aliases: ['yaourt', 'yaourt nature', 'yogourt'] },
  cottage_cheese:    { cal: 78,  prot: 11.1, gluc: 3.4,  lip: 2.3,  aliases: ['cottage cheese', 'cottage'] },
  skyr:              { cal: 67,  prot: 11.0, gluc: 4.4,  lip: 0.2,  aliases: ['skyr'] },
  lait_demi:         { cal: 46,  prot: 3.2,  gluc: 4.9,  lip: 1.6,  aliases: ['lait', 'lait demi-écrémé', 'lait demi ecrémé'] },
  lait_entier:       { cal: 65,  prot: 3.2,  gluc: 4.7,  lip: 3.5,  aliases: ['lait entier'] },
  lait_ecrémé:       { cal: 35,  prot: 3.4,  gluc: 4.9,  lip: 0.1,  aliases: ['lait écrémé', 'lait ecreme'] },
  lait_amande:       { cal: 24,  prot: 0.5,  gluc: 3.0,  lip: 1.1,  aliases: ['lait amande', 'boisson amande'] },
  lait_avoine:       { cal: 46,  prot: 1.2,  gluc: 7.5,  lip: 1.5,  aliases: ['lait avoine', 'boisson avoine'] },
  mozzarella:        { cal: 246, prot: 17.8, gluc: 2.2,  lip: 18.8, aliases: ['mozzarella'] },
  emmental:          { cal: 383, prot: 27.6, gluc: 0.5,  lip: 30.4, aliases: ['emmental', 'gruyère', 'comté'] },
  parmesan:          { cal: 392, prot: 35.8, gluc: 3.2,  lip: 25.8, aliases: ['parmesan'] },
  beurre:            { cal: 749, prot: 0.7,  gluc: 0.6,  lip: 82.5, aliases: ['beurre'], portionStd: 10, portionLabel: 'noix' },

  // ── Compléments sportifs ──────────────────────────────────────────────────
  whey_isolat:       { cal: 380, prot: 90.0, gluc: 4.0,  lip: 1.5,  aliases: ['whey', 'whey iso', 'whey isolat', 'whey protein', 'protéine whey', 'protéine en poudre'] },
  caseine:           { cal: 370, prot: 78.0, gluc: 9.5,  lip: 3.5,  aliases: ['caséine', 'caseine', 'protéine caséine', 'casein'] },
  creatine:          { cal: 0,   prot: 0,    gluc: 0,    lip: 0,    aliases: ['créatine', 'creatine'] },

  // ── Féculents ─────────────────────────────────────────────────────────────
  riz_blanc_cuit:    { cal: 130, prot: 2.7,  gluc: 28.2, lip: 0.3,  aliases: ['riz', 'riz blanc', 'riz blanc cuit', 'riz cuit'] },
  riz_blanc_cru:     { cal: 356, prot: 6.7,  gluc: 78.9, lip: 0.7,  aliases: ['riz cru', 'riz blanc cru'] },
  riz_complet_cuit:  { cal: 123, prot: 2.6,  gluc: 25.8, lip: 0.9,  aliases: ['riz complet', 'riz complet cuit'] },
  pates_cuites:      { cal: 157, prot: 5.5,  gluc: 30.9, lip: 1.1,  aliases: ['pâtes', 'pates', 'pâtes cuites', 'pates cuites', 'spaghetti', 'tagliatelles', 'penne'] },
  pates_crues:       { cal: 356, prot: 12.5, gluc: 69.5, lip: 1.8,  aliases: ['pâtes crues', 'pates crues'] },
  pomme_de_terre:    { cal: 77,  prot: 2.0,  gluc: 17.5, lip: 0.1,  aliases: ['pomme de terre', 'patate', 'pommes de terre', 'patates', 'pomme de terre cuite'] },
  patate_douce:      { cal: 86,  prot: 1.6,  gluc: 20.1, lip: 0.1,  aliases: ['patate douce', 'patate douce cuite', 'patate douces'] },
  flocons_avoine:    { cal: 372, prot: 11.0, gluc: 66.3, lip: 7.1,  aliases: ['flocons avoine', 'avoine', 'porridge', 'oatmeal'] },
  pain_complet:      { cal: 247, prot: 9.6,  gluc: 41.3, lip: 3.2,  aliases: ['pain complet', 'pain aux céréales'], portionStd: 35, portionLabel: 'tranche' },
  pain_blanc:        { cal: 266, prot: 8.3,  gluc: 50.5, lip: 2.4,  aliases: ['pain', 'pain blanc', 'baguette', 'tartine'], portionStd: 30, portionLabel: 'tranche' },
  quinoa_cuit:       { cal: 120, prot: 4.4,  gluc: 21.3, lip: 1.9,  aliases: ['quinoa', 'quinoa cuit'] },
  lentilles_cuites:  { cal: 116, prot: 9.0,  gluc: 20.1, lip: 0.4,  aliases: ['lentilles', 'lentilles cuites', 'lentilles vertes'] },

  // ── Légumes ───────────────────────────────────────────────────────────────
  brocoli:           { cal: 34,  prot: 2.8,  gluc: 6.6,  lip: 0.4,  aliases: ['brocoli', 'brocolis'] },
  epinards:          { cal: 23,  prot: 2.9,  gluc: 3.6,  lip: 0.4,  aliases: ['épinards', 'epinards'] },
  courgette:         { cal: 17,  prot: 1.2,  gluc: 3.1,  lip: 0.2,  aliases: ['courgette', 'courgettes'] },
  tomate:            { cal: 18,  prot: 0.9,  gluc: 3.9,  lip: 0.2,  aliases: ['tomate', 'tomates'], portionStd: 120, portionLabel: 'tomate' },
  concombre:         { cal: 15,  prot: 0.6,  gluc: 3.6,  lip: 0.1,  aliases: ['concombre'] },
  haricots_verts:    { cal: 31,  prot: 1.8,  gluc: 7.0,  lip: 0.1,  aliases: ['haricots verts', 'haricot vert'] },
  salade:            { cal: 13,  prot: 1.3,  gluc: 2.4,  lip: 0.2,  aliases: ['salade', 'laitue', 'roquette', 'mâche'] },
  poivron:           { cal: 28,  prot: 1.0,  gluc: 6.3,  lip: 0.2,  aliases: ['poivron', 'poivrons'] },
  champignon:        { cal: 22,  prot: 3.1,  gluc: 3.3,  lip: 0.3,  aliases: ['champignon', 'champignons', 'champignons de paris'] },
  avocat:            { cal: 160, prot: 2.0,  gluc: 8.5,  lip: 14.7, aliases: ['avocat', 'avocats'], portionStd: 100, portionLabel: 'avocat' },
  carotte:           { cal: 41,  prot: 0.9,  gluc: 9.6,  lip: 0.2,  aliases: ['carotte', 'carottes'] },
  oignon:            { cal: 40,  prot: 1.1,  gluc: 9.3,  lip: 0.1,  aliases: ['oignon', 'oignons', 'échalote'] },

  // ── Fruits ────────────────────────────────────────────────────────────────
  banane:            { cal: 89,  prot: 1.1,  gluc: 23.1, lip: 0.3,  aliases: ['banane', 'bananes'], portionStd: 120, portionLabel: 'banane' },
  pomme:             { cal: 52,  prot: 0.3,  gluc: 13.8, lip: 0.2,  aliases: ['pomme', 'pommes'], portionStd: 150, portionLabel: 'pomme' },
  orange:            { cal: 47,  prot: 0.9,  gluc: 11.8, lip: 0.1,  aliases: ['orange', 'oranges'], portionStd: 150, portionLabel: 'orange' },
  myrtilles:         { cal: 57,  prot: 0.7,  gluc: 14.5, lip: 0.3,  aliases: ['myrtilles', 'myrtille', 'blueberries'] },
  fraises:           { cal: 32,  prot: 0.7,  gluc: 7.7,  lip: 0.3,  aliases: ['fraises', 'fraise'] },
  mangue:            { cal: 60,  prot: 0.8,  gluc: 15.0, lip: 0.4,  aliases: ['mangue', 'mangues'] },
  ananas:            { cal: 50,  prot: 0.5,  gluc: 13.1, lip: 0.1,  aliases: ['ananas'] },

  // ── Corps gras ────────────────────────────────────────────────────────────
  huile_olive:       { cal: 899, prot: 0,    gluc: 0,    lip: 99.9, aliases: ['huile', 'huile olive', 'huile d\'olive'], portionStd: 10, portionLabel: 'cuillère' },
  huile_coco:        { cal: 897, prot: 0,    gluc: 0,    lip: 99.9, aliases: ['huile coco', 'huile de coco'] },
  noix:              { cal: 654, prot: 15.2, gluc: 14.0, lip: 65.2, aliases: ['noix', 'noix de grenoble'] },
  amandes:           { cal: 575, prot: 21.1, gluc: 21.6, lip: 49.9, aliases: ['amandes', 'amande'] },
  cacahuetes:        { cal: 567, prot: 25.8, gluc: 16.1, lip: 49.2, aliases: ['cacahuètes', 'cacahuetes', 'arachides', 'beurre de cacahuète', 'peanut butter'] },

  // ── Divers & Boissons ─────────────────────────────────────────────────────
  chocolat_noir_70:  { cal: 598, prot: 7.8,  gluc: 45.9, lip: 42.6, aliases: ['chocolat noir', 'chocolat', 'chocolat 70%'], portionStd: 20, portionLabel: 'carré' },
  miel:              { cal: 304, prot: 0.3,  gluc: 82.4, lip: 0,    aliases: ['miel'], portionStd: 15, portionLabel: 'cuillère' },
  confiture:         { cal: 278, prot: 0.4,  gluc: 69.5, lip: 0.1,  aliases: ['confiture'], portionStd: 15, portionLabel: 'cuillère' },
  sucre:             { cal: 400, prot: 0,    gluc: 100,  lip: 0,    aliases: ['sucre'], portionStd: 5, portionLabel: 'cuillère' },
  sauce_soja:        { cal: 53,  prot: 8.1,  gluc: 4.9,  lip: 0,    aliases: ['sauce soja', 'soja'] },
  ketchup:           { cal: 112, prot: 1.1,  gluc: 26.1, lip: 0.1,  aliases: ['ketchup'] },
  cafe:              { cal: 2,   prot: 0.3,  gluc: 0,    lip: 0,    aliases: ['café', 'cafe', 'expresso'] },
  jus_orange:        { cal: 43,  prot: 0.5,  gluc: 10.4, lip: 0.2,  aliases: ['jus orange', "jus d'orange"] },
}

// ── Parser ────────────────────────────────────────────────────────────────────

interface ParsedIngredient {
  raw: string
  quantity: number   // en grammes (ou ml)
  food: string       // clé dans FOOD_DB
  entry: FoodEntry
  macros: { cal: number; prot: number; gluc: number; lip: number }
}

export interface NutritionResult {
  ingredients: ParsedIngredient[]
  totals: { cal: number; prot: number; gluc: number; lip: number }
  nom: string
  details: string
  unrecognized: string[]
}

// Normalise une chaîne pour la comparaison
function normalize(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/['']/g, "'")
    .trim()
}

// Trouve le meilleur match dans la DB pour un nom d'aliment
function findFood(name: string): [string, FoodEntry] | null {
  const n = normalize(name)

  // Match exact sur les aliases
  for (const [key, entry] of Object.entries(FOOD_DB)) {
    for (const alias of entry.aliases) {
      if (normalize(alias) === n) return [key, entry]
    }
  }

  // Match partiel — le nom contient un alias
  let bestMatch: [string, FoodEntry] | null = null
  let bestLen = 0
  for (const [key, entry] of Object.entries(FOOD_DB)) {
    for (const alias of entry.aliases) {
      const a = normalize(alias)
      if (n.includes(a) && a.length > bestLen) {
        bestMatch = [key, entry]
        bestLen = a.length
      }
    }
  }
  if (bestMatch) return bestMatch

  // Match inverse — un alias contient le nom
  for (const [key, entry] of Object.entries(FOOD_DB)) {
    for (const alias of entry.aliases) {
      if (normalize(alias).includes(n) && n.length >= 4) return [key, entry]
    }
  }

  return null
}

// Parse une quantité depuis un texte : "200g", "1.5kg", "100ml", "2 tranches", "1 oeuf"
function parseQuantity(text: string, entry?: FoodEntry): number {
  const n = normalize(text)

  // Cherche un nombre + unité
  const match = n.match(/(\d+[.,]?\d*)\s*(g|gr|gramme?s?|kg|ml|l\b|cl)?/)
  if (match) {
    const val = parseFloat(match[1].replace(',', '.'))
    const unit = match[2] ?? ''
    if (unit === 'kg') return val * 1000
    if (unit === 'l') return val * 1000
    if (unit === 'cl') return val * 10
    return val // g ou ml ou nombre brut
  }

  // Nombre seul → portion standard si disponible
  const numMatch = n.match(/^(\d+[.,]?\d*)/)
  if (numMatch && entry?.portionStd) {
    return parseFloat(numMatch[1].replace(',', '.')) * entry.portionStd
  }

  // Mots-clés de portion
  if (n.includes('tranche') || n.includes('slice')) return entry?.portionStd ?? 30
  if (n.includes('oeuf') || n.includes('oeuf') || n.includes('egg')) return entry?.portionStd ?? 60
  if (n.includes('cuillere') || n.includes('cuillère') || n.includes('cs') || n.includes('csoupe')) return entry?.portionStd ?? 15
  if (n.includes('cc') || n.includes('cafe')) return 5
  if (n.includes('verre')) return 250
  if (n.includes('tasse')) return 200
  if (n.includes('bol')) return 300

  return entry?.portionStd ?? 100
}

// Parse une ligne du type "200g de poulet grillé"
function parseLine(line: string): ParsedIngredient | null {
  const clean = line.trim().replace(/^[-•*]\s*/, '')
  if (!clean) return null

  // Patterns possibles :
  // "200g de poulet grillé"
  // "200g poulet"
  // "poulet 200g"
  // "1 banane"
  // "2 oeufs"

  // Essai : nombre/unité en tête
  const frontMatch = clean.match(/^(\d+[.,]?\d*\s*(?:g|gr|grammes?|kg|ml|l\b|cl)?)\s*(?:de |d'|du |d'un |d'une )?\s*(.+)$/i)
  if (frontMatch) {
    const quantStr = frontMatch[1]
    const foodStr = frontMatch[2].trim()
    const found = findFood(foodStr)
    if (found) {
      const qty = parseQuantity(quantStr, found[1])
      const factor = qty / 100
      return {
        raw: clean,
        quantity: qty,
        food: found[0],
        entry: found[1],
        macros: {
          cal:  Math.round(found[1].cal  * factor),
          prot: Math.round(found[1].prot * factor * 10) / 10,
          gluc: Math.round(found[1].gluc * factor * 10) / 10,
          lip:  Math.round(found[1].lip  * factor * 10) / 10,
        },
      }
    }
  }

  // Essai : aliment en tête + quantité en fin
  const backMatch = clean.match(/^(.+?)\s+(\d+[.,]?\d*\s*(?:g|gr|grammes?|kg|ml|l\b|cl)?)$/i)
  if (backMatch) {
    const foodStr = backMatch[1].trim()
    const quantStr = backMatch[2]
    const found = findFood(foodStr)
    if (found) {
      const qty = parseQuantity(quantStr, found[1])
      const factor = qty / 100
      return {
        raw: clean,
        quantity: qty,
        food: found[0],
        entry: found[1],
        macros: {
          cal:  Math.round(found[1].cal  * factor),
          prot: Math.round(found[1].prot * factor * 10) / 10,
          gluc: Math.round(found[1].gluc * factor * 10) / 10,
          lip:  Math.round(found[1].lip  * factor * 10) / 10,
        },
      }
    }
  }

  // Essai : aliment seul (sans quantité)
  const found = findFood(clean)
  if (found) {
    const qty = found[1].portionStd ?? 100
    const factor = qty / 100
    return {
      raw: clean,
      quantity: qty,
      food: found[0],
      entry: found[1],
      macros: {
        cal:  Math.round(found[1].cal  * factor),
        prot: Math.round(found[1].prot * factor * 10) / 10,
        gluc: Math.round(found[1].gluc * factor * 10) / 10,
        lip:  Math.round(found[1].lip  * factor * 10) / 10,
      },
    }
  }

  return null
}

// Point d'entrée principal
export function analyzeNutrition(input: string): NutritionResult {
  // Sépare les ingrédients
  const lines = input
    .split(/[+\n,;]/)
    .map(l => l.trim())
    .filter(l => l.length > 0)

  const ingredients: ParsedIngredient[] = []
  const unrecognized: string[] = []

  for (const line of lines) {
    const result = parseLine(line)
    if (result) {
      ingredients.push(result)
    } else if (line.trim().length > 2) {
      unrecognized.push(line.trim())
    }
  }

  const totals = ingredients.reduce(
    (acc, ing) => ({
      cal:  acc.cal  + ing.macros.cal,
      prot: acc.prot + ing.macros.prot,
      gluc: acc.gluc + ing.macros.gluc,
      lip:  acc.lip  + ing.macros.lip,
    }),
    { cal: 0, prot: 0, gluc: 0, lip: 0 },
  )

  // Arrondi final
  totals.prot = Math.round(totals.prot * 10) / 10
  totals.gluc = Math.round(totals.gluc * 10) / 10
  totals.lip  = Math.round(totals.lip  * 10) / 10

  // Génère un nom de repas automatique
  const mainFoods = ingredients.slice(0, 2).map(i => {
    const alias = i.entry.aliases[0]
    return alias.charAt(0).toUpperCase() + alias.slice(1)
  })
  const nom = mainFoods.length > 0
    ? mainFoods.join(' + ') + (ingredients.length > 2 ? ` +${ingredients.length - 2}` : '')
    : 'Repas analysé'

  const details = ingredients.length > 0
    ? `${ingredients.length} ingrédient${ingredients.length > 1 ? 's' : ''} analysé${ingredients.length > 1 ? 's' : ''}${unrecognized.length > 0 ? ` · ${unrecognized.length} non reconnu${unrecognized.length > 1 ? 's' : ''}` : ''}`
    : 'Aucun ingrédient reconnu'

  return { ingredients, totals, nom, details, unrecognized }
}
