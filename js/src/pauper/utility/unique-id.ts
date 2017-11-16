let prevId = 0;
const uniqueFunc = typeof UTILITY_GetUnique !== "undefined" ? UTILITY_GetUnique : () => prevId++;

export const uniqueId: () => number = typeof UTILITY_GetUnique !== "undefined"
	? UTILITY_GetUnique
	: () => prevId++;
