<script>
	import Chart from '$lib/components/Chart.svelte';
	import { fetchStats } from '$lib/fetcher.js';

	let dbData = $state([]);
	let connData = $state([]);
	let activityData = $state([]);
	let sizeData = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');
	let refreshInterval = $state(5000);

	const totalConnections = $derived(connData.reduce((s, c) => s + parseInt(c.count), 0));
	const activeCount = $derived(connData.find(c => c.state === 'active')?.count ?? 0);
	const totalCommits = $derived(dbData.reduce((s, d) => s + parseInt(d.xact_commit || 0), 0));
	const totalRollbacks = $derived(dbData.reduce((s, d) => s + parseInt(d.xact_rollback || 0), 0));
	const avgCacheHit = $derived(
		dbData.length > 0
			? (dbData.reduce((s, d) => s + parseFloat(d.cache_hit_ratio || 0), 0) / dbData.length).toFixed(1)
			: '0'
	);

	const connChartData = $derived({
		labels: connData.map(c => c.state || 'null'),
		datasets: [{
			label: 'Baglanti Sayisi',
			data: connData.map(c => parseInt(c.count)),
			backgroundColor: ['#22c55e', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
			borderWidth: 0,
			borderRadius: 4
		}]
	});

	const dbChartData = $derived({
		labels: dbData.map(d => d.datname),
		datasets: [
			{
				label: 'Cache Hit %',
				data: dbData.map(d => parseFloat(d.cache_hit_ratio)),
				backgroundColor: 'rgba(99,102,241,0.7)',
				borderRadius: 4
			}
		]
	});

	const sizeChartData = $derived({
		labels: sizeData.map(d => d.datname),
		datasets: [{
			label: 'Boyut (MB)',
			data: sizeData.map(d => (parseInt(d.size_bytes) / 1048576).toFixed(2)),
			backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'],
			borderWidth: 0
		}]
	});

	const txChartData = $derived({
		labels: dbData.map(d => d.datname),
		datasets: [
			{
				label: 'Commit',
				data: dbData.map(d => parseInt(d.xact_commit || 0)),
				backgroundColor: 'rgba(34,197,94,0.7)',
				borderRadius: 4
			},
			{
				label: 'Rollback',
				data: dbData.map(d => parseInt(d.xact_rollback || 0)),
				backgroundColor: 'rgba(239,68,68,0.7)',
				borderRadius: 4
			}
		]
	});

	async function loadAll() {
		try {
			const [db, conn, act, sz] = await Promise.all([
				fetchStats('database'),
				fetchStats('connections'),
				fetchStats('activity'),
				fetchStats('db_size')
			]);
			dbData = db.data;
			connData = conn.data;
			activityData = act.data;
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
		loadAll();
		const id = setInterval(loadAll, refreshInterval);
		return () => clearInterval(id);
	});
</script>

<div class="page-header">
	<h2>Genel Bakis</h2>
	<div class="refresh-controls">
		<select class="btn" bind:value={refreshInterval}>
			<option value={3000}>3s</option>
			<option value={5000}>5s</option>
			<option value={10000}>10s</option>
			<option value={30000}>30s</option>
		</select>
		<span class="refresh-badge">Son: {lastUpdate || '...'}</span>
		<button class="btn btn-primary" onclick={loadAll}>Yenile</button>
	</div>
</div>

{#if error}
	<div class="error-box">{error}</div>
{/if}

{#if loading}
	<div class="loading-spinner">Veriler yukleniyor...</div>
{:else}
	<div class="grid grid-4" style="margin-bottom:1.5rem">
		<div class="card">
			<div class="card-title">Toplam Baglanti</div>
			<div class="card-value">{totalConnections}</div>
			<div class="card-sub">{activeCount} aktif</div>
		</div>
		<div class="card">
			<div class="card-title">Cache Hit Orani</div>
			<div class="card-value">{avgCacheHit}%</div>
			<div class="card-sub">Ortalama (tum DB)</div>
		</div>
		<div class="card">
			<div class="card-title">Toplam Commit</div>
			<div class="card-value">{totalCommits.toLocaleString()}</div>
			<div class="card-sub">Tum veritabanlari</div>
		</div>
		<div class="card">
			<div class="card-title">Toplam Rollback</div>
			<div class="card-value" style="color:var(--danger)">{totalRollbacks.toLocaleString()}</div>
			<div class="card-sub">Tum veritabanlari</div>
		</div>
	</div>

	<div class="grid grid-2" style="margin-bottom:1.5rem">
		<div class="card">
			<div class="card-title">Baglanti Durumlari</div>
			<Chart type="doughnut" data={connChartData} options={{
				scales: { x: { display: false }, y: { display: false } },
				plugins: { legend: { position: 'bottom', labels: { color: '#8b90a0' } } }
			}} />
		</div>
		<div class="card">
			<div class="card-title">Veritabani Boyutlari</div>
			<Chart type="pie" data={sizeChartData} options={{
				scales: { x: { display: false }, y: { display: false } },
				plugins: { legend: { position: 'bottom', labels: { color: '#8b90a0' } } }
			}} />
		</div>
	</div>

	<div class="grid grid-2">
		<div class="card">
			<div class="card-title">Cache Hit Orani (%)</div>
			<Chart type="bar" data={dbChartData} />
		</div>
		<div class="card">
			<div class="card-title">Transaction (Commit / Rollback)</div>
			<Chart type="bar" data={txChartData} />
		</div>
	</div>
{/if}
