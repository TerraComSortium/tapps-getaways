/**
 * Tarifas de las actividades incluidas en un getaway (academia, torneos y
 * ladders). El getaway solo guarda los ids; el backend adjunta los documentos
 * completos, y de ahí sale el precio de cada uno.
 *
 * Los tres los guardan en `fees`, pero con tipos distintos: número en torneos,
 * string en ladders, y en academia anidado dentro de `scheduled[]`.
 *
 * IMPORTANTE: esta misma aritmética existe en el backend (`Payment.createPurchase`).
 * Si cambia aquí, hay que cambiarla allí o los pagos se rechazan por amount_mismatch.
 */

const toAmount = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  const amount = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

/**
 * Una clase de academia cobra una única matrícula aunque tenga varias sesiones
 * semanales, así que se toma la primera tarifa no vacía de `scheduled[]`.
 */
export const getAcademyFee = (item: unknown): number => {
  const sessions = (item as { scheduled?: { fees?: unknown }[] })?.scheduled;
  if (!Array.isArray(sessions)) return toAmount((item as { fees?: unknown })?.fees);

  for (const session of sessions) {
    const fee = toAmount(session?.fees);
    if (fee > 0) return fee;
  }
  return toAmount((item as { fees?: unknown })?.fees);
};

export const getTournamentFee = (item: unknown): number => toAmount((item as { fees?: unknown })?.fees);

export const getLadderFee = (item: unknown): number => toAmount((item as { fees?: unknown })?.fees);

export interface ScheduleFeeLine {
  id: string;
  name: string;
  price: number;
  kind: 'academy' | 'tournament' | 'ladder';
}

const nameOf = (item: unknown, fallback: string): string => {
  const record = item as { name?: unknown; title?: unknown; description?: unknown };
  const candidate = record?.name ?? record?.title ?? record?.description;
  return typeof candidate === 'string' && candidate.trim() ? candidate : fallback;
};

const idOf = (item: unknown, index: number, kind: string): string => {
  const id = (item as { id?: unknown })?.id;
  return typeof id === 'string' && id ? id : `${kind}-${index}`;
};

/** Desglose de las actividades incluidas, para mostrarlo y para sumarlo. */
export const getScheduleFeeLines = (getaway: {
  academyClasses?: unknown[];
  tournaments?: unknown[];
  ladders?: unknown[];
} | null | undefined): ScheduleFeeLine[] => {
  if (!getaway) return [];

  const build = (
    items: unknown[] | undefined,
    kind: ScheduleFeeLine['kind'],
    fee: (item: unknown) => number,
  ): ScheduleFeeLine[] =>
    (Array.isArray(items) ? items : []).map((item, index) => ({
      id: idOf(item, index, kind),
      name: nameOf(item, kind),
      price: fee(item),
      kind,
    }));

  return [
    ...build(getaway.academyClasses, 'academy', getAcademyFee),
    ...build(getaway.tournaments, 'tournament', getTournamentFee),
    ...build(getaway.ladders, 'ladder', getLadderFee),
  ];
};

/** Suma de todas las actividades incluidas en el getaway. */
export const sumScheduleFees = (getaway: Parameters<typeof getScheduleFeeLines>[0]): number =>
  getScheduleFeeLines(getaway).reduce((total, line) => total + line.price, 0);

/**
 * Servicios/amenities incluidos: suma de precio unitario × días de cada uno.
 * Forma parte del valor del getaway (se cobra siempre y no se lista aparte).
 * Getaways viejos (solo `name`) suman 0.
 *
 * IMPORTANTE: el backend repite este cálculo en `src/getaways/libs/pricing.ts`
 * (`amenitiesTotal`). Si divergen, el pago se rechaza por amount_mismatch.
 */
export const sumAmenities = (amenities: unknown): number => {
  const items = Array.isArray(amenities) ? amenities : [];
  const total = items.reduce(
    (sum: number, item: { unitPrice?: unknown; days?: unknown }) => sum + lineTotal(item?.unitPrice, item?.days),
    0
  );
  return Math.round(total * 100) / 100;
};

/**
 * Total de una línea con precio por día (alojamiento o amenity): precio unitario
 * × días, redondeado a centavos. Mismo cálculo que el backend (`libs/pricing.ts`).
 */
export const lineTotal = (unitPrice: unknown, days: unknown): number => {
  const price = toAmount(unitPrice);
  const wholeDays = Math.max(Math.floor(Number(days) || 0), 0);
  return Math.round(price * wholeDays * 100) / 100;
};
