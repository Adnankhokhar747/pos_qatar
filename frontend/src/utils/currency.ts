const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(value: number, currency = "QAR"): string {
	let formatter = formatterCache.get(currency);
	if (!formatter) {
		formatter = new Intl.NumberFormat("en-QA", {
			style: "currency",
			currency,
			currencyDisplay: "symbol",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		formatterCache.set(currency, formatter);
	}
	return formatter.format(value || 0);
}
