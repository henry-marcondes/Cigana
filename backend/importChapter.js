const fs = require('fs');
const pool = require('./src/db/connection'); // ajuste o caminho

async function run() {
    try {
  const content = fs.readFileSync('textos/cultura/02_idioma.txt', 'utf-8');

  await pool.query(
    'INSERT INTO chapters (book_id, title, content) VALUES ($1, $2, $3)ON CONFLICT (book_id, title) DO UPDATE SET content = EXCLUDED.content',
    [2, ' Idioma  ',content]
  );

    console.log('Capítulo inserido!');
  } catch(err){
    console.error('Erro na inserção: ', err);
  } finally{
    await pool.end();
 }
}
run();
