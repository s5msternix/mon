<script>
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');
	let refreshInterval = $state(3000);

	const activeQueries = $derived(data.filter(d => d.state === 'active'));
	const idleQueries = $derived(data.filter(d => d.state !== 'active'));

	async function load() {
		try {
			const res = await fetchStats('activity');
			data = res.data;
			lastUpdate = new Date().toLocaleTimeString('tr-TR');
			error = '';
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
		const id = setInterval(load, refreshInterval);
		return () => clearInterval(id);
	});

	/** @param {string|null} state */
	function badgeClass(state) {
		if (state === 'active') return 'badge-active';
		if (state === 'idle') return 'badge-idle';
		if (state?.includes('idle in transaction')) return 'badge-warning';
		return 'badge-disabled';
	}
</script>

<div class="page-header">
	<h2>Aktif Sorgular (pg_stat_activity)</h2>
	<div class="refresh-controls">
		<select class="btn" bind:value={refreshInterval}>
			<option value={2000}>2s</option>
			<option value={3000}>3s</option>
			<option value={5000}>5s</option>
			<option value={10000}>10s</option>
		</select>
		<span class="refresh-badge">Son: {lastUpdate || '...'}</span>
		<button class="btn btn-primary" onclick={load}>Yenile</button>
	</div>
</div>

{#if error}
	<div class="error-box">{error}</div>
{/if}

{#if loading}
	<div class="loading-spinner">Yukleniyor...</div>
{:else}
	<div class="grid grid-3" style="margin-bottom:1.5rem">
		<div class="card">
			<div class="card-title">Toplam Proses</div>
			<div class="card-value">{data.length}</div>
		</div>
		<div class="card">
			<div class="card-title">Aktif Sorgu</div>
			<div class="card-value" style="color:var(--success)">{activeQueries.length}</div>
		</div>
		<div class="card">
			<div class="card-title">Bosta (Idle)</div>
			<div class="card-value" style="color:var(--warning)">{idleQueries.length}</div>
		</div>
	</div>

	<div class="card">
		<div class="card-title">Tum Prosesler</div>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>PID</th>
						<th>Kullanici</th>
						<th>Veritabani</th>
						<th>Durum</th>
						<th>Sure (s)</th>
						<th>Wait</th>
						<th>Sorgu</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row}
						<tr>
							<td>{row.pid}</td>
							<td>{row.usename || '-'}</td>
							<td>{row.datname || '-'}</td>
							<td><span class="badge {badgeClass(row.state)}">{row.state || '-'}</span></td>
							<td>{row.query_duration_sec ?? '-'}</td>
							<td>{row.wait_event || '-'}</td>
							<td class="query-cell" title={row.query}>{row.query || '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
