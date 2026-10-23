import { readFileSync } from "node:fs";
import { Client } from "pg";

function getDatabaseUrl() {
  const env = readFileSync(".env", "utf8");

  const match = env.match(/^DATABASE_URL=(.*)$/m);

  if (!match) {
    throw new Error("DATABASE_URL tidak ditemukan di .env");
  }

  return match[1].trim().replace(/^["']|["']$/g, "");
}

const client = new Client({
  connectionString: getDatabaseUrl(),
});

try {
  await client.connect();

  const count = await client.query(`
    SELECT COUNT(*)::int AS total
    FROM daily_check_ins
  `);

  const dummy = await client.query(`
    SELECT COUNT(*)::int AS total
    FROM daily_check_ins
    WHERE user_id = 11
  `);

  const duplicates = await client.query(`
    SELECT
      user_id::text,
      created_at::date::text AS tanggal,
      COUNT(*)::int AS jumlah
    FROM daily_check_ins
    WHERE created_at IS NOT NULL
    GROUP BY user_id, created_at::date
    HAVING COUNT(*) > 1
    ORDER BY jumlah DESC
    LIMIT 10
  `);

  const missingDates = await client.query(`
    SELECT COUNT(*)::int AS total
    FROM daily_check_ins
    WHERE created_at IS NULL
  `);

  console.log("=== PEMERIKSAAN CHECK-IN MINDGLOW ===");
  console.log("Total Check-in:", count.rows[0].total);
  console.log("Check-in akun dummy:", dummy.rows[0].total);
  console.log("Check-in tanpa tanggal:", missingDates.rows[0].total);
  console.log("Duplikat tanggal:", duplicates.rows);

} catch (error) {
  console.error("Pemeriksaan gagal:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
