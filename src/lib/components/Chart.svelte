<script>
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	/** @type {{ type?: string, data: any, options?: any }} */
	const { type = 'bar', data, options = {} } = $props();

	/** @type {HTMLCanvasElement|undefined} */
	let canvas = $state();
	/** @type {Chart|undefined} */
	let chart = $state();

	const defaultOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				labels: { color: '#8b90a0', font: { size: 11 } }
			}
		},
		scales: {
			x: {
				ticks: { color: '#8b90a0', font: { size: 10 } },
				grid: { color: 'rgba(42,46,61,0.5)' }
			},
			y: {
				ticks: { color: '#8b90a0', font: { size: 10 } },
				grid: { color: 'rgba(42,46,61,0.5)' }
			}
		}
	};

	$effect(() => {
		if (!canvas) return;

		const merged = mergeOptions(defaultOptions, options);

		if (chart) {
			chart.data = data;
			chart.options = merged;
			chart.update('none');
		} else {
			chart = new Chart(canvas, {
				type,
				data,
				options: merged
			});
		}

		return () => {
			if (chart) {
				chart.destroy();
				chart = undefined;
			}
		};
	});

	/**
	 * @param {any} base
	 * @param {any} override
	 */
	function mergeOptions(base, override) {
		const result = { ...base };
		for (const key of Object.keys(override)) {
			if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
				result[key] = mergeOptions(base[key] || {}, override[key]);
			} else {
				result[key] = override[key];
			}
		}
		return result;
	}
</script>

<div class="chart-container">
	<canvas bind:this={canvas}></canvas>
</div>
