<script>
	import Chart from '$lib/components/Chart.svelte';
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');

	const grantedCount = $derived(data.filter(d => d.granted).length);
	const waitingCount = $derived(data.filter(d => !d.granted).length);

	const modeGroups = $derived(() => {
		/** @type {Record<string, number>} */
		const map = {};
		for (const row of data) {
			map[row.mode] = (map[row.mode] || 0) + 1;
		}
		return map;
	});

	const chartData = $derived(() => {
		const groups = modeGroups();
		return {
			labels: Object.keys(groups),
			datasets: [{
				label: 'Kilit Sayisi',
				data: Object.values(groups),
				backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'],
				borderRadius: 4
			}]
		};
	});

	async function load() {
		try {
			const res = await fetchStats('locks');
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
		const id = setInterval(load, 5000);
		return () => clearInterval(id);
	});
</script>

<div class="page-header">
	<h2>Kilitler (pg_locks)</h2>
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
			<div class="card-title">Toplam Kilit</div>
			<div class="card-value">{data.length}</div>
		</div>
		<div class="card">
			<div class="card-title">Granted</div>
			<div class="card-value" style="color:var(--success)">{grantedCount}</div>
		</div>
		<div class="card">
			<div class="card-title">Bekleyen</div>
			<div class="card-value" style="color:var(--danger)">{waitingCount}</div>
		</div>
	</div>

	<div class="card" style="margin-bottom:1.5rem">
		<div class="card-title">Kilit Modu Dagilimi</div>
		<Chart type="bar" data={chartData()} />
	</div>

	<div class="card">
		<div class="card-title">Kilit Detaylari</div>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>PID</th>
						<th>Kullanici</th>
						<th>Tip</th>
						<th>Mod</th>
						<th>Granted</th>
						<th>Durum</th>
						<th>Sorgu</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row}
						<tr>
							<td>{row.pid}</td>
							<td>{row.usename || '-'}</td>
							<td>{row.locktype}</td>
							<td>{row.mode}</td>
							<td>
								<span class="badge" class:badge-active={row.granted} class:badge-idle={!row.granted}>
									{row.granted ? 'Evet' : 'Hayir'}
								</span>
							</td>
							<td><span class="badge badge-waiting">{row.state || '-'}</span></td>
							<td class="query-cell" title={row.query}>{row.query || '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
