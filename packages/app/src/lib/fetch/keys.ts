import type { ProductsFilter } from "$lib/schema";

type QueryKey = ReadonlyArray<unknown>;

export const createProductKey = (id: string): QueryKey => ["products", id];

export const createProductByFilterKey = (filter: Partial<ProductsFilter>) => ['products', ...Object.values(filter)]

export const createProductExistsKey = (id: string) => ['products', 'exists', id]

export const createCurrencyConversionKey = (currency: string): QueryKey => [
  "currency-conversion",
  currency,
];

export const createCurrencyAmountConversionKey = (
  currency: string,
  amount: number,
): QueryKey => [...createCurrencyConversionKey(currency), amount];
