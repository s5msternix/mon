<script>
	import '../app.css';

	const { children } = $props();

	const navSections = [
		{
			title: 'Genel',
			items: [
				{ id: 'overview', label: 'Genel Bakis', icon: '&#9673;' },
				{ id: 'activity', label: 'Aktif Sorgular', icon: '&#9654;' },
				{ id: 'connections', label: 'Baglantilar', icon: '&#8644;' }
			]
		},
		{
			title: 'Performans',
			items: [
				{ id: 'databases', label: 'Veritabanlari', icon: '&#9632;' },
				{ id: 'tables', label: 'Tablolar', icon: '&#9638;' },
				{ id: 'indexes', label: 'Indeksler', icon: '&#8801;' }
			]
		},
		{
			title: 'Sistem',
			items: [
				{ id: 'bgwriter', label: 'BG Writer', icon: '&#9881;' },
				{ id: 'locks', label: 'Kilitler', icon: '&#128274;' },
				{ id: 'replication', label: 'Replikasyon', icon: '&#8634;' }
			]
		}
	];
</script>

<div class="app-shell">
	<nav class="sidebar">
		<div class="sidebar-brand">
			<h1>PG Monitor</h1>
			<p>PostgreSQL Izleme Araci</p>
		</div>

		{#each navSections as section}
			<div class="nav-section">
				<div class="nav-section-title">{section.title}</div>
				{#each section.items as item}
					<a
						class="nav-item"
						class:active={false}
						href="/{item.id === 'overview' ? '' : item.id}"
					>
						<span class="nav-icon">{@html item.icon}</span>
						{item.label}
					</a>
				{/each}
			</div>
		{/each}
	</nav>

	<main class="main-content">
		{@render children()}
	</main>
</div>
