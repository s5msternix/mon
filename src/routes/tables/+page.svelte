<script>
	import Chart from '$lib/components/Chart.svelte';
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');

	const top10 = $derived(data.slice(0, 10));

	const rowChartData = $derived({
		labels: top10.map(d => d.relname),
		datasets: [
			{ label: 'Live Tuples', data: top10.map(d => parseInt(d.n_live_tup || 0)), backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4 },
			{ label: 'Dead Tuples', data: top10.map(d => parseInt(d.n_dead_tup || 0)), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 }
		]
	});

	const scanChartData = $derived({
		labels: top10.map(d => d.relname),
		datasets: [
			{ label: 'Seq Scan', data: top10.map(d => parseInt(d.seq_scan || 0)), backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 },
			{ label: 'Idx Scan', data: top10.map(d => parseInt(d.idx_scan || 0)), backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4 }
		]
	});

	async function load() {
		try {
			const res = await fetchStats('tables');
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
		const id = setInterval(load, 10000);
		return () => clearInterval(id);
	});
</script>

<div class="page-header">
	<h2>Tablolar (pg_stat_user_tables)</h2>
	<div class="refresh-controls">
		<span class="refresh-badge">Son: {lastUpdate || '...'}</span>
		<button class="btn btn-primary" onclick={load}>Yenile</button>
	</div>
</div>

{#if error}<div class="error-box">{error}</div>{/if}

{#if loading}
	<div class="loading-spinner">Yukleniyor...</div>
{:else}
	<div class="grid grid-2" style="margin-bottom:1.5rem">
		<div class="card">
			<div class="card-title">Live / Dead Tuples (Top 10)</div>
			<Chart type="bar" data={rowChartData} />
		</div>
		<div class="card">
			<div class="card-title">Seq Scan vs Index Scan (Top 10)</div>
			<Chart type="bar" data={scanChartData} />
		</div>
	</div>

	<div class="card">
		<div class="card-title">Tablo Detaylari</div>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Sema</th>
						<th>Tablo</th>
						<th>Seq Scan</th>
						<th>Idx Scan</th>
						<th>Live Tup</th>
						<th>Dead Tup</th>
						<th>Insert</th>
						<th>Update</th>
						<th>Delete</th>
						<th>Son Vacuum</th>
						<th>Son Analyze</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row}
						<tr>
							<td>{row.schemaname}</td>
							<td><strong>{row.relname}</strong></td>
							<td>{parseInt(row.seq_scan || 0).toLocaleString()}</td>
							<td>{parseInt(row.idx_scan || 0).toLocaleString()}</td>
							<td>{parseInt(row.n_live_tup || 0).toLocaleString()}</td>
							<td style="color:{parseInt(row.n_dead_tup)>1000?'var(--danger)':'inherit'}">{parseInt(row.n_dead_tup || 0).toLocaleString()}</td>
							<td>{parseInt(row.n_tup_ins || 0).toLocaleString()}</td>
							<td>{parseInt(row.n_tup_upd || 0).toLocaleString()}</td>
							<td>{parseInt(row.n_tup_del || 0).toLocaleString()}</td>
							<td>{row.last_autovacuum ? new Date(row.last_autovacuum).toLocaleString('tr-TR') : '-'}</td>
							<td>{row.last_autoanalyze ? new Date(row.last_autoanalyze).toLocaleString('tr-TR') : '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
