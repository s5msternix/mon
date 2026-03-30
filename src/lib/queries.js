export const QUERIES = {
	activity: `
		SELECT
			datname,
			pid,
			usename,
			application_name,
			client_addr,
			state,
			wait_event_type,
			wait_event,
			query,
			backend_start,
			query_start,
			EXTRACT(EPOCH FROM (now() - query_start))::numeric(10,2) AS query_duration_sec
		FROM pg_stat_activity
		WHERE pid <> pg_backend_pid()
		ORDER BY query_start DESC NULLS LAST
	`,

	database: `
		SELECT
			datname,
			numbackends,
			xact_commit,
			xact_rollback,
			blks_read,
			blks_hit,
			tup_returned,
			tup_fetched,
			tup_inserted,
			tup_updated,
			tup_deleted,
			conflicts,
			temp_files,
			temp_bytes,
			deadlocks,
			CASE WHEN (blks_hit + blks_read) > 0
				THEN round(blks_hit::numeric / (blks_hit + blks_read) * 100, 2)
				ELSE 0
			END AS cache_hit_ratio
		FROM pg_stat_database
		WHERE datname IS NOT NULL
		ORDER BY datname
	`,

	tables: `
		SELECT
			schemaname,
			relname,
			seq_scan,
			seq_tup_read,
			idx_scan,
			idx_tup_fetch,
			n_tup_ins,
			n_tup_upd,
			n_tup_del,
			n_live_tup,
			n_dead_tup,
			last_vacuum,
			last_autovacuum,
			last_analyze,
			last_autoanalyze
		FROM pg_stat_user_tables
		ORDER BY n_live_tup DESC
		LIMIT 50
	`,

	indexes: `
		SELECT
			schemaname,
			relname,
			indexrelname,
			idx_scan,
			idx_tup_read,
			idx_tup_fetch,
			pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
		FROM pg_stat_user_indexes
		ORDER BY idx_scan DESC
		LIMIT 50
	`,

	bgwriter: `
		SELECT
			checkpoints_timed,
			checkpoints_req,
			checkpoint_write_time,
			checkpoint_sync_time,
			buffers_checkpoint,
			buffers_clean,
			maxwritten_clean,
			buffers_backend,
			buffers_backend_fsync,
			buffers_alloc
		FROM pg_stat_bgwriter
	`,

	replication: `
		SELECT
			client_addr,
			state,
			sent_lsn,
			write_lsn,
			flush_lsn,
			replay_lsn,
			sync_state
		FROM pg_stat_replication
	`,

	locks: `
		SELECT
			l.locktype,
			l.database,
			l.relation,
			l.page,
			l.tuple,
			l.pid,
			l.mode,
			l.granted,
			a.usename,
			a.query,
			a.state
		FROM pg_locks l
		JOIN pg_stat_activity a ON l.pid = a.pid
		WHERE a.pid <> pg_backend_pid()
		ORDER BY l.granted, l.pid
		LIMIT 100
	`,

	connections: `
		SELECT
			state,
			COUNT(*) AS count
		FROM pg_stat_activity
		WHERE pid <> pg_backend_pid()
		GROUP BY state
		ORDER BY count DESC
	`,

	db_size: `
		SELECT
			datname,
			pg_size_pretty(pg_database_size(datname)) AS size,
			pg_database_size(datname) AS size_bytes
		FROM pg_database
		WHERE datistemplate = false
		ORDER BY pg_database_size(datname) DESC
	`
};
