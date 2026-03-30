/**
 * @param {string} type
 * @returns {Promise<{data: any[], timestamp: string}>}
 */
export async function fetchStats(type) {
	const res = await fetch(`/api/stats?type=${type}`);
	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.detail || err.error || 'API hatasi');
	}
	return res.json();
}
