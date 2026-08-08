BEGIN;

TRUNCATE TABLE
    comentarios,
    avaliacoes,
    favoritos,
    marcadores,
    progresso_leitura,
    cena_videos,
    cena_audios,
    cena_imagens,
    escolhas,
    cenas,
    capitulos,
    livro_autores,
    autores,
    perfis_usuario,
    livros,
    categorias,
    bibliotecas,
    usuarios
RESTART IDENTITY CASCADE;

COMMIT;
