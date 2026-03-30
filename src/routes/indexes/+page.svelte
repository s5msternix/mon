<script>
	import Chart from '$lib/components/Chart.svelte';
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');

	const top15 = $derived(data.slice(0, 15));

	const chartData = $derived({
		labels: top15.map(d => d.indexrelname),
		datasets: [{
			label: 'Index Scans',
			data: top15.map(d => parseInt(d.idx_scan || 0)),
			backgroundColor: 'rgba(99,102,241,0.7)',
			borderRadius: 4
		}]
	});

	const unusedIndexes = $derived(data.filter(d => parseInt(d.idx_scan || 0) === 0));

	async function load() {
		try {
			const res = await fetchStats('indexes');
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
		const id = setInterval(load, 15000);
		return () => clearInterval(id);
	});
</script>

<div class="page-header">
	<h2>Indeksler (pg_stat_user_indexes)</h2>
	<div class="refresh-controls">
		<span class="refresh-badge">Son: {lastUpdate || '...'}</span>
		<button class="btn btn-primary" onclick={load}>Yenile</button>
	</div>
</div>

{#if error}<div class="error-box">{error}</div>{/if}

{#if loading}
	<div class="loading-spinner">Yukleniyor...</div>
{:else}
	<div class="grid grid-3" style="margin-bottom:1.5rem">
		<div class="card">
			<div class="card-title">Toplam Indeks</div>
			<div class="card-value">{data.length}</div>
		</div>
		<div class="card">
			<div class="card-title">Kullanilmayan Indeks</div>
			<div class="card-value" style="color:var(--warning)">{unusedIndexes.length}</div>
			<div class="card-sub">idx_scan = 0</div>
		</div>
		<div class="card">
			<div class="card-title">En Cok Kullanilan</div>
			<div class="card-value">{top15[0]?.indexrelname || '-'}</div>
			<div class="card-sub">{top15[0]?.idx_scan || 0} scan</div>
		</div>
	</div>

	<div class="card" style="margin-bottom:1.5rem">
		<div class="card-title">Index Scan Dagilimi (Top 15)</div>
		<Chart type="bar" data={chartData} options={{ indexAxis: 'y' }} />
	</div>

	<div class="card">
		<div class="card-title">Tum Indeksler</div>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Sema</th>
						<th>Tablo</th>
						<th>Indeks</th>
						<th>Scan</th>
						<th>Tup Read</th>
						<th>Tup Fetch</th>
						<th>Boyut</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row}
						<tr>
							<td>{row.schemaname}</td>
							<td>{row.relname}</td>
							<td><strong>{row.indexrelname}</strong></td>
							<td>{parseInt(row.idx_scan || 0).toLocaleString()}</td>
							<td>{parseInt(row.idx_tup_read || 0).toLocaleString()}</td>
							<td>{parseInt(row.idx_tup_fetch || 0).toLocaleString()}</td>
							<td>{row.index_size}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
