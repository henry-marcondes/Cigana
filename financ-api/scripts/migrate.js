const fs = require('node:fs/promises');
const path = require('node:path');
const { criarPool } = require('../src/db/pool');

const diretorioMigrations = path.resolve(__dirname, '../database/migrations');

async function executarMigrations() {
    const pool = criarPool();
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.financ_api_migrations (
                filename text PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            )
        `);

        const arquivos = (await fs.readdir(diretorioMigrations))
            .filter((arquivo) => /^\d+_[a-z0-9_]+\.sql$/.test(arquivo))
            .sort();

        for (const filename of arquivos) {
            const aplicada = await client.query(
                'SELECT 1 FROM public.financ_api_migrations WHERE filename = $1',
                [filename]
            );

            if (aplicada.rowCount > 0) continue;

            const sql = await fs.readFile(path.join(diretorioMigrations, filename), 'utf8');
            await client.query('BEGIN');

            try {
                await client.query(sql);
                await client.query(
                    'INSERT INTO public.financ_api_migrations (filename) VALUES ($1)',
                    [filename]
                );
                await client.query('COMMIT');
                console.log(`Migration aplicada: ${filename}`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }

        console.log('Migrations da financ-api concluídas.');
    } finally {
        client.release();
        await pool.end();
    }
}

if (require.main === module) {
    executarMigrations().catch(() => {
        console.error('Falha ao executar migrations da financ-api. Verifique banco e arquivos de migration.');
        process.exitCode = 1;
    });
}

module.exports = { executarMigrations };
