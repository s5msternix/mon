import { json } from '@sveltejs/kit';
import { query } from '$lib/db.js';
import { QUERIES } from '$lib/queries.js';

export async function GET({ url }) {
	const type = url.searchParams.get('type');

	if (!type || !QUERIES[type]) {
		return json(
			{ error: 'Geçersiz sorgu tipi. Geçerli tipler: ' + Object.keys(QUERIES).join(', ') },
			{ status: 400 }
		);
	}

	try {
		const rows = await query(QUERIES[type]);
		return json({ data: rows, timestamp: new Date().toISOString() });
	} catch (err) {
		return json(
			{ error: 'Veritabanı sorgu hatası', detail: err.message },
			{ status: 500 }
		);
	}
}
