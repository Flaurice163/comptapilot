import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `${formatNumber(amount)} Ar`
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(date))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function generateReference(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(4, '0')}`
}

export function isBalanced(debit: number, credit: number): boolean {
  return Math.round(debit * 100) === Math.round(credit * 100)
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function sumArray(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0)
}
