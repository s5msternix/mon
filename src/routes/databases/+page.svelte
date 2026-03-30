<script>
	import Chart from '$lib/components/Chart.svelte';
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state([]);
	let sizeData = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');
	let refreshInterval = $state(5000);

	const cacheChartData = $derived({
		labels: data.map(d => d.datname),
		datasets: [{
			label: 'Cache Hit %',
			data: data.map(d => parseFloat(d.cache_hit_ratio)),
			backgroundColor: data.map(d =>
				parseFloat(d.cache_hit_ratio) > 95 ? 'rgba(34,197,94,0.7)' :
				parseFloat(d.cache_hit_ratio) > 80 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)'
			),
			borderRadius: 4
		}]
	});

	const tuplesChartData = $derived({
		labels: data.map(d => d.datname),
		datasets: [
			{ label: 'Returned', data: data.map(d => parseInt(d.tup_returned || 0)), backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4 },
			{ label: 'Fetched', data: data.map(d => parseInt(d.tup_fetched || 0)), backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4 },
			{ label: 'Inserted', data: data.map(d => parseInt(d.tup_inserted || 0)), backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 4 },
			{ label: 'Updated', data: data.map(d => parseInt(d.tup_updated || 0)), backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 },
			{ label: 'Deleted', data: data.map(d => parseInt(d.tup_deleted || 0)), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 }
		]
	});

	async function load() {
		try {
			const [db, sz] = await Promise.all([fetchStats('database'), fetchStats('db_size')]);
			data = db.data;
			sizeData = sz.data;
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
</script>

<div class="page-header">
	<h2>Veritabanlari (pg_stat_database)</h2>
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
			<div class="card-title">Cache Hit Orani (%)</div>
			<Chart type="bar" data={cacheChartData} options={{ scales: { y: { min: 0, max: 100 } } }} />
		</div>
		<div class="card">
			<div class="card-title">Tuple Islemleri</div>
			<Chart type="bar" data={tuplesChartData} />
		</div>
	</div>

	<div class="card">
		<div class="card-title">Veritabani Detaylari</div>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Veritabani</th>
						<th>Boyut</th>
						<th>Baglanti</th>
						<th>Commit</th>
						<th>Rollback</th>
						<th>Cache Hit %</th>
						<th>Blk Read</th>
						<th>Blk Hit</th>
						<th>Deadlock</th>
						<th>Temp Files</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row}
						<tr>
							<td><strong>{row.datname}</strong></td>
							<td>{sizeData.find(s => s.datname === row.datname)?.size || '-'}</td>
							<td>{row.numbackends}</td>
							<td>{parseInt(row.xact_commit).toLocaleString()}</td>
							<td style="color:var(--danger)">{parseInt(row.xact_rollback).toLocaleString()}</td>
							<td>
								<span class="badge" class:badge-active={parseFloat(row.cache_hit_ratio)>95} class:badge-idle={parseFloat(row.cache_hit_ratio)<=95}>
									{row.cache_hit_ratio}%
								</span>
							</td>
							<td>{parseInt(row.blks_read).toLocaleString()}</td>
							<td>{parseInt(row.blks_hit).toLocaleString()}</td>
							<td style="color:var(--danger)">{row.deadlocks}</td>
							<td>{row.temp_files}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
