import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    // Verify the transaction belongs to this user's ETFs
    const tx = await prisma.investTransaction.findFirst({
      where: { id, etf: { userId } },
    })
    if (!tx) return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })

    await prisma.investTransaction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
