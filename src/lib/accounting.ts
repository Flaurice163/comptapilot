import type {
  JournalEntry,
  Account,
  GrandLivreAccount,
  BalanceRow,
  CompteResultat,
  Bilan,
  DashboardKPI,
  Period,
} from '../types'

// ============================================================
// GRAND LIVRE
// ============================================================

export function computeGrandLivre(
  entries: JournalEntry[],
  accounts: Account[],
  period?: Period,
): GrandLivreAccount[] {
  const filtered = period
    ? entries.filter((e) => e.date >= period.start && e.date <= period.end)
    : entries

  const accountMap = new Map(accounts.map((a) => [a.number, a]))
  const glMap = new Map<string, GrandLivreAccount>()

  // Initialise all accounts that appear in entries
  for (const entry of filtered) {
    for (const line of entry.lines ?? []) {
      const accNum = line.account_number ?? ''
      if (!glMap.has(accNum)) {
        const account = accountMap.get(accNum)
        if (account) {
          glMap.set(accNum, {
            account,
            rows: [],
            total_debit: 0,
            total_credit: 0,
            balance: 0,
          })
        }
      }
    }
  }

  // Fill rows
  const sortedEntries = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  for (const entry of sortedEntries) {
    for (const line of entry.lines ?? []) {
      const accNum = line.account_number ?? ''
      const gl = glMap.get(accNum)
      if (!gl) continue

      gl.total_debit += line.debit
      gl.total_credit += line.credit

      // Running balance (debit positive)
      const runningBalance = gl.total_debit - gl.total_credit

      gl.rows.push({
        date: entry.date,
        reference: entry.reference,
        journal: entry.journal,
        label: line.label || entry.label,
        debit: line.debit,
        credit: line.credit,
        balance: runningBalance,
        entry_id: entry.id,
      })

      gl.balance = runningBalance
    }
  }

  // Sort by account number
  return Array.from(glMap.values()).sort((a, b) =>
    a.account.number.localeCompare(b.account.number),
  )
}

// ============================================================
// BALANCE
// ============================================================

export function computeBalance(gl: GrandLivreAccount[]): BalanceRow[] {
  return gl.map((g) => ({
    account_number: g.account.number,
    account_label: g.account.label,
    account_class: g.account.class,
    total_debit: g.total_debit,
    total_credit: g.total_credit,
    solde_debiteur: g.balance > 0 ? g.balance : 0,
    solde_crediteur: g.balance < 0 ? Math.abs(g.balance) : 0,
  }))
}

// ============================================================
// COMPTE DE RÉSULTAT
// ============================================================

export function computeCompteResultat(
  gl: GrandLivreAccount[],
): CompteResultat {
  const charges = gl
    .filter((g) => g.account.class === '6')
    .map((g) => ({
      account_number: g.account.number,
      account_label: g.account.label,
      // Charges are debit-normal; net = debit - credit
      amount: g.total_debit - g.total_credit,
    }))
    .filter((r) => r.amount !== 0)

  const produits = gl
    .filter((g) => g.account.class === '7')
    .map((g) => ({
      account_number: g.account.number,
      account_label: g.account.label,
      // Produits are credit-normal; net = credit - debit
      amount: g.total_credit - g.total_debit,
    }))
    .filter((r) => r.amount !== 0)

  const total_charges = charges.reduce((s, r) => s + r.amount, 0)
  const total_produits = produits.reduce((s, r) => s + r.amount, 0)
  const resultat = total_produits - total_charges

  return { produits, charges, total_produits, total_charges, resultat }
}

// ============================================================
// BILAN
// ============================================================

export function computeBilan(gl: GrandLivreAccount[]): Bilan {
  const getAmount = (g: GrandLivreAccount) => {
    // Debit-normal accounts (actif): positive when debit > credit
    // Credit-normal accounts (passif): positive when credit > debit
    if (g.account.type === 'actif') return g.total_debit - g.total_credit
    if (g.account.type === 'passif') return g.total_credit - g.total_debit
    return Math.abs(g.balance)
  }

  const toItem = (g: GrandLivreAccount) => ({
    account_number: g.account.number,
    account_label: g.account.label,
    amount: getAmount(g),
  })

  const immobilisations = gl
    .filter((g) => g.account.class === '2' && g.account.type === 'actif')
    .map(toItem)
    .filter((r) => r.amount !== 0)

  const stocks = gl
    .filter((g) => g.account.class === '3')
    .map(toItem)
    .filter((r) => r.amount !== 0)

  const creances = gl
    .filter((g) => g.account.number.startsWith('41'))
    .map(toItem)
    .filter((r) => r.amount !== 0)

  const tresorerie = gl
    .filter((g) => g.account.class === '5' && g.account.type === 'actif')
    .map(toItem)
    .filter((r) => r.amount !== 0)

  const capitaux = gl
    .filter((g) => g.account.class === '1' && g.account.type === 'passif' && !g.account.number.startsWith('120'))
    .map(toItem)
    .filter((r) => r.amount !== 0)

  const dettes = gl
    .filter(
      (g) =>
        (g.account.class === '4' && g.account.type === 'passif') ||
        g.account.class === '1' && g.account.number.startsWith('16'),
    )
    .map(toItem)
    .filter((r) => r.amount !== 0)

  // Résultat from compte de résultat
  const cr = computeCompteResultat(gl)

  const totalActif =
    immobilisations.reduce((s, r) => s + r.amount, 0) +
    stocks.reduce((s, r) => s + r.amount, 0) +
    creances.reduce((s, r) => s + r.amount, 0) +
    tresorerie.reduce((s, r) => s + r.amount, 0)

  const totalPassif =
    capitaux.reduce((s, r) => s + r.amount, 0) +
    dettes.reduce((s, r) => s + r.amount, 0) +
    cr.resultat

  return {
    actif: { immobilisations, stocks, creances, tresorerie, total: totalActif },
    passif: { capitaux, dettes, resultat: cr.resultat, total: totalPassif },
    is_balanced: Math.abs(totalActif - totalPassif) < 1,
  }
}

// ============================================================
// DASHBOARD KPI
// ============================================================

export function computeKPI(gl: GrandLivreAccount[]): DashboardKPI {
  const tresorerie = gl
    .filter((g) => g.account.class === '5' && g.account.type === 'actif')
    .reduce((s, g) => s + (g.total_debit - g.total_credit), 0)

  const chiffre_affaires = gl
    .filter((g) => g.account.class === '7')
    .reduce((s, g) => s + (g.total_credit - g.total_debit), 0)

  const total_charges = gl
    .filter((g) => g.account.class === '6')
    .reduce((s, g) => s + (g.total_debit - g.total_credit), 0)

  return {
    chiffre_affaires,
    total_charges,
    resultat: chiffre_affaires - total_charges,
    tresorerie,
  }
}

// ============================================================
// MONTHLY CA for chart
// ============================================================

export function computeMonthlySeries(entries: JournalEntry[], accounts: Account[]) {
  const months: Record<string, { ca: number; charges: number }> = {}

  for (const entry of entries) {
    const month = entry.date.substring(0, 7) // YYYY-MM
    if (!months[month]) months[month] = { ca: 0, charges: 0 }

    for (const line of entry.lines ?? []) {
      const acc = accounts.find((a) => a.number === line.account_number)
      if (!acc) continue
      if (acc.class === '7') months[month].ca += line.credit - line.debit
      if (acc.class === '6') months[month].charges += line.debit - line.credit
    }
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(
        new Date(month + '-01'),
      ),
      ca: Math.max(0, data.ca),
      charges: Math.max(0, data.charges),
      resultat: data.ca - data.charges,
    }))
}
