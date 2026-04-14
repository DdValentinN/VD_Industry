import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export function calculateBenefit(
  prixVente: number,
  prixAchat: number,
  fraisDivers: number,
): number {
  return prixVente - prixAchat - fraisDivers
}

export function calculateMarge(prixVente: number, benefice: number): number {
  if (prixVente === 0) return 0
  return benefice / prixVente
}
