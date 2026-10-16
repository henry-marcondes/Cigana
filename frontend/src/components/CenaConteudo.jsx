import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      <article className="font-mono text-base leading-8 text-gray-700">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => (
              <h1
                className="mb-6 mt-8 text-3xl font-bold leading-tight text-gray-900"
                {...props}
              >
                {children}
              </h1>
            ),

            h2: ({ children, ...props }) => (
              <h2
                className="mb-4 mt-7 text-2xl font-bold leading-tight text-gray-800"
                {...props}
              >
                {children}
              </h2>
            ),

            h3: ({ children, ...props }) => (
              <h3
                className="mb-3 mt-6 text-xl font-bold text-gray-800"
                 {...props}
              >
                {children}
              </h3>
            ),

            p: ({ children, ...props }) => (
              <p
                className="mb-5"
                {...props}
              >
                {children}
              </p>
            ),

            ul: ({ children, ...props }) => (
              <ul
                className="mb-5 list-disc space-y-2 pl-6"
                {...props}
              >
                {children}
              </ul>
            ),

            ol: ({ children, ...props }) => (
              <ol
                className="mb-5 list-decimal space-y-2 pl-6"
                {...props}
              >
                {children}
              </ol>
            ),

            blockquote: ({ children, ...props }) => (
              <blockquote
                className="my-6 border-l-4 border-gray-300 pl-4 italic text-gray-600"
                {...props}
              >
                {children}
              </blockquote>
            ),

            hr: (props) => (
              <hr className="my-8 border-gray-300" {...props} />
            ),
                  table: ({ children, ...props }) => (
        <div className="my-6 w-full overflow-x-auto">
          <table
            className="w-full border-collapse border border-gray-300 text-left text-sm"
            {...props}
          >
            {children}
          </table>
        </div>
      ),

      thead: ({ children, ...props }) => (
        <thead
          className="bg-gray-100"
          {...props}
        >
          {children}
        </thead>
      ),

      tbody: ({ children, ...props }) => (
        <tbody {...props}>
          {children}
        </tbody>
      ),

      tr: ({ children, ...props }) => (
        <tr
          className="border-b border-gray-300"
          {...props}
        >
          {children}
        </tr>
      ),

      th: ({ children, ...props }) => (
        <th
          className="border border-gray-300 px-4 py-2 font-bold text-gray-900"
          {...props}
        >
          {children}
        </th>
      ),

      td: ({ children, ...props }) => (
        <td
          className="border border-gray-300 px-4 py-2"
          {...props}
        >
          {children}
        </td>
      ),
        
      pre: ({ children, ...props }) => (
        <pre
          className="my-5 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-6 text-gray-800"
          {...props}
        >
          {children}
        </pre>
      ),

      code: ({ children, className, ...props }) => (
        <code
          className={className}
          {...props}
        >
          {children}
        </code>
      ),
        
          }}
        >

          {dados.texto || ''}
        </ReactMarkdown>
      </article>
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
