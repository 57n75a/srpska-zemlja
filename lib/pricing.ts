// Single source of truth for pricing — used by the reservation API,
// the reservation UI, and (eventually) billing/webhooks.
// Existing reservations keep the rate they locked in; changing these
// numbers only affects reservations created after the change.

export type TermId = 'MONTHLY' | 'YEAR_1' | 'YEAR_3' | 'YEAR_5' | 'YEAR_10';

export interface PricingTier {
  id: TermId;
  label: string;
  yearlyRatePerM2: number; // USD per m^2 per year, at this term
  years: number;           // contract length in years (monthly = 1/12)
  discountPct: number;
  badge?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  { id: 'MONTHLY', label: 'Monthly',  yearlyRatePerM2: 12,          years: 1 / 12, discountPct: 0 },
  { id: 'YEAR_1',  label: '1 year',   yearlyRatePerM2: 10,          years: 1,      discountPct: 0,  badge: '2 months free' },
  { id: 'YEAR_3',  label: '3 years',  yearlyRatePerM2: 10 * 0.95,   years: 3,      discountPct: 5 },
  { id: 'YEAR_5',  label: '5 years',  yearlyRatePerM2: 10 * 0.90,   years: 5,      discountPct: 10 },
  { id: 'YEAR_10', label: '10 years', yearlyRatePerM2: 10 * 0.85,   years: 10,     discountPct: 15 },
];

export function getTier(id: TermId): PricingTier {
  const tier = PRICING_TIERS.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown pricing term: ${id}`);
  return tier;
}

export function calculateTotal(unitCount: number, termId: TermId): number {
  const tier = getTier(termId);
  return Math.round(unitCount * tier.yearlyRatePerM2 * tier.years * 100) / 100;
}

export const VOJVODA_THRESHOLD_M2 = 1000;
