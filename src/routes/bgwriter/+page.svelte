<script>
	import Chart from '$lib/components/Chart.svelte';
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state(null);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');

	const chartData = $derived(data ? {
		labels: ['Checkpoint (Timed)', 'Checkpoint (Req)', 'Buffers Checkpoint', 'Buffers Clean', 'Buffers Backend', 'Buffers Alloc'],
		datasets: [{
			label: 'Deger',
			data: [
				data.checkpoints_timed,
				data.checkpoints_req,
				data.buffers_checkpoint,
				data.buffers_clean,
				data.buffers_backend,
				data.buffers_alloc
			],
			backgroundColor: [
				'rgba(99,102,241,0.7)', 'rgba(34,197,94,0.7)', 'rgba(245,158,11,0.7)',
				'rgba(239,68,68,0.7)', 'rgba(59,130,246,0.7)', 'rgba(139,92,246,0.7)'
			],
			borderRadius: 4
		}]
	} : null);

	const timeChartData = $derived(data ? {
		labels: ['Write Time', 'Sync Time'],
		datasets: [{
			data: [parseFloat(data.checkpoint_write_time), parseFloat(data.checkpoint_sync_time)],
			backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(245,158,11,0.7)'],
			borderWidth: 0
		}]
	} : null);

	async function load() {
		try {
			const res = await fetchStats('bgwriter');
			data = res.data[0] || null;
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
	<h2>Background Writer (pg_stat_bgwriter)</h2>
	<div class="refresh-controls">
		<span class="refresh-badge">Son: {lastUpdate || '...'}</span>
		<button class="btn btn-primary" onclick={load}>Yenile</button>
	</div>
</div>

{#if error}<div class="error-box">{error}</div>{/if}

{#if loading}
	<div class="loading-spinner">Yukleniyor...</div>
{:else if data}
	<div class="grid grid-4" style="margin-bottom:1.5rem">
		<div class="card">
			<div class="card-title">Checkpoints (Timed)</div>
			<div class="card-value">{parseInt(data.checkpoints_timed).toLocaleString()}</div>
		</div>
		<div class="card">
			<div class="card-title">Checkpoints (Req)</div>
			<div class="card-value" style="color:var(--warning)">{parseInt(data.checkpoints_req).toLocaleString()}</div>
		</div>
		<div class="card">
			<div class="card-title">Buffers Backend</div>
			<div class="card-value">{parseInt(data.buffers_backend).toLocaleString()}</div>
		</div>
		<div class="card">
			<div class="card-title">Buffers Alloc</div>
			<div class="card-value">{parseInt(data.buffers_alloc).toLocaleString()}</div>
		</div>
	</div>

	<div class="grid grid-2">
		<div class="card">
			<div class="card-title">Buffer Istatistikleri</div>
			<Chart type="bar" data={chartData} />
		</div>
		<div class="card">
			<div class="card-title">Checkpoint Sureleri (ms)</div>
			<Chart type="doughnut" data={timeChartData} options={{
				scales: { x: { display: false }, y: { display: false } },
				plugins: { legend: { position: 'bottom', labels: { color: '#8b90a0' } } }
			}} />
		</div>
	</div>
{/if}
