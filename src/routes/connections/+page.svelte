<script>
	import Chart from '$lib/components/Chart.svelte';
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');
	let refreshInterval = $state(5000);

	/** @type {Array<{state: string, count: number, timestamp: string}>} */
	let history = $state([]);

	const total = $derived(data.reduce((s, c) => s + parseInt(c.count), 0));

	const chartData = $derived({
		labels: data.map(c => c.state || 'null'),
		datasets: [{
			data: data.map(c => parseInt(c.count)),
			backgroundColor: ['#22c55e', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
			borderWidth: 0
		}]
	});

	const historyChartData = $derived(() => {
		const last30 = history.slice(-30);
		return {
			labels: last30.map(h => h.timestamp),
			datasets: [{
				label: 'Toplam Baglanti',
				data: last30.map(h => h.count),
				borderColor: '#6366f1',
				backgroundColor: 'rgba(99,102,241,0.1)',
				fill: true,
				tension: 0.3,
				pointRadius: 2
			}]
		};
	});

	async function load() {
		try {
			const res = await fetchStats('connections');
			data = res.data;
			const t = new Date().toLocaleTimeString('tr-TR');
			const sum = res.data.reduce((/** @type {number} */ s, /** @type {any} */ c) => s + parseInt(c.count), 0);
			history = [...history.slice(-59), { state: 'total', count: sum, timestamp: t }];
			lastUpdate = t;
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
	<h2>Baglantilar (pg_stat_activity)</h2>
	<div class="refresh-controls">
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
			<div class="card-title">Toplam Baglanti</div>
			<div class="card-value">{total}</div>
		</div>
		{#each data as conn}
			<div class="card">
				<div class="card-title">{conn.state || 'null'}</div>
				<div class="card-value">{conn.count}</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-2">
		<div class="card">
			<div class="card-title">Baglanti Dagilimi</div>
			<Chart type="doughnut" data={chartData} options={{
				scales: { x: { display: false }, y: { display: false } },
				plugins: { legend: { position: 'bottom', labels: { color: '#8b90a0' } } }
			}} />
		</div>
		<div class="card">
			<div class="card-title">Baglanti Gecmisi (Canli)</div>
			<Chart type="line" data={historyChartData()} />
		</div>
	</div>
{/if}
