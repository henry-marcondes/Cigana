export default function CenaConteudo({ conteudo }) {
  if (!conteudo) {
    return null;
  }

  const { tipo_conteudo, dados } = conteudo;

  /*
   * ============================================================
   * TEXTO
   * ============================================================
   */

  if (tipo_conteudo === 'TEXTO') {
    return (
      <div className="whitespace-pre-line text-lg leading-8 text-gray-700">
        {dados.texto}
      </div>
    );
  }

  /*
   * ============================================================
   * IMAGEM
   * ============================================================
   */

  if (tipo_conteudo === 'IMAGEM') {
    return (
      <figure>
        <img
          src={dados.imagem_url}
          alt={
            dados.texto_alternativo ||
            dados.titulo ||
            'Imagem da cena'
          }
          className="mx-auto max-h-[900px] w-auto rounded-lg object-contain"
        />

        {dados.legenda && (
          <figcaption className="mt-2 text-center text-sm text-gray-500">
            {dados.legenda}
          </figcaption>
        )}
      </figure>
    );
  }

  /*
   * ============================================================
   * ÁUDIO
   * ============================================================
   */

  if (tipo_conteudo === 'AUDIO') {
    return (
      <div>
        {dados.titulo && (
          <p className="mb-2 font-medium text-gray-800">
            {dados.titulo}
          </p>
        )}

        {dados.legenda && (
          <p className="mb-2 text-sm text-gray-500">
            {dados.legenda}
          </p>
        )}

        <audio
          controls
          autoPlay={dados.reproducao_automatica}
          loop={dados.reproducao_em_loop}
          className="w-full"
        >
          <source
            src={dados.audio_url}
            type="audio/mpeg"
          />

          Seu navegador não suporta o elemento de áudio.
        </audio>
      </div>
    );
  }

  /*
   * ============================================================
   * VÍDEO
   * ============================================================
   */

  if (tipo_conteudo === 'VIDEO') {
    return (
      <figure>
        <video
          controls
          autoPlay={dados.reproducao_automatica}
          loop={dados.reproducao_em_loop}
          poster={dados.miniatura_url || undefined}
          className="mx-auto w-full rounded-lg"
        >
          <source
            src={dados.video_url}
            type="video/mp4"
          />

          Seu navegador não suporta o elemento de vídeo.
        </video>

        {dados.legenda && (
          <figcaption className="mt-2 text-center text-sm text-gray-500">
            {dados.legenda}
          </figcaption>
        )}
      </figure>
    );
  }

  /*
   * ============================================================
   * TIPO DESCONHECIDO
   * ============================================================
   */

  return null;
}
