import { NextRequest, NextResponse } from 'next/server'
import { analyzeNutrition } from '@/lib/nutrition'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    const result = analyzeNutrition(message)

    if (result.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Aucun aliment reconnu. Essaie avec des noms plus précis (ex : "200g poulet + 150g riz")' },
        { status: 422 },
      )
    }

    return NextResponse.json({
      data: {
        nom: result.nom,
        calories: result.totals.cal,
        proteines: result.totals.prot,
        glucides: result.totals.gluc,
        lipides: result.totals.lip,
        details: result.details,
        ingredients: result.ingredients.map(i => ({
          nom: i.entry.aliases[0],
          quantite: i.quantity,
          ...i.macros,
        })),
        unrecognized: result.unrecognized,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur calcul' }, { status: 500 })
  }
}
