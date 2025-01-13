export const minDistance = 7;

export function isBetween(value: number, min: number, max?: number) {
	const minValue = Math.min(min, max ?? min);
	const maxValue = Math.max(min, max ?? min);

	return value >= minValue - minDistance && value <= maxValue + minDistance;
}
