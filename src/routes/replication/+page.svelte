<script>
	import { fetchStats } from '$lib/fetcher.js';

	let data = $state([]);
	let loading = $state(true);
	let error = $state('');
	let lastUpdate = $state('');

	async function load() {
		try {
			const res = await fetchStats('replication');
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
	<h2>Replikasyon (pg_stat_replication)</h2>
	<div class="refresh-controls">
		<span class="refresh-badge">Son: {lastUpdate || '...'}</span>
		<button class="btn btn-primary" onclick={load}>Yenile</button>
	</div>
</div>

{#if error}<div class="error-box">{error}</div>{/if}

{#if loading}
	<div class="loading-spinner">Yukleniyor...</div>
{:else if data.length === 0}
	<div class="card">
		<div class="card-title">Bilgi</div>
		<p style="color:var(--text-muted);padding:1rem 0">Aktif replikasyon baglantisi bulunamadi.</p>
	</div>
{:else}
	<div class="grid grid-3" style="margin-bottom:1.5rem">
		<div class="card">
			<div class="card-title">Replica Sayisi</div>
			<div class="card-value">{data.length}</div>
		</div>
		<div class="card">
			<div class="card-title">Sync Durumu</div>
			<div class="card-value">{data[0]?.sync_state || '-'}</div>
		</div>
		<div class="card">
			<div class="card-title">Durum</div>
			<div class="card-value">{data[0]?.state || '-'}</div>
		</div>
	</div>

	<div class="card">
		<div class="card-title">Replikasyon Detaylari</div>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Client</th>
						<th>State</th>
						<th>Sent LSN</th>
						<th>Write LSN</th>
						<th>Flush LSN</th>
						<th>Replay LSN</th>
						<th>Sync</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row}
						<tr>
							<td>{row.client_addr || '-'}</td>
							<td><span class="badge badge-active">{row.state}</span></td>
							<td>{row.sent_lsn || '-'}</td>
							<td>{row.write_lsn || '-'}</td>
							<td>{row.flush_lsn || '-'}</td>
							<td>{row.replay_lsn || '-'}</td>
							<td>{row.sync_state}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
