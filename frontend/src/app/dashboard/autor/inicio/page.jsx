import Link from 'next/link';

export default function InicioAutorPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm text-gray-600 underline hover:text-gray-900"
        >
          ← Voltar ao Dashboard
        </Link>

        <section className="rounded-lg bg-white p-6 shadow sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Quero ser Autor
          </h1>

          <div className="mt-6 space-y-4 text-gray-700">
            <p>
              Para atuar como Autor na Plataforma Cigana, você começa
              apresentando uma proposta de obra.
            </p>

            <p>
              A plataforma avaliará sua proposta. Se ela for aprovada, a obra
              será liberada no Estúdio para você começar a construí-la e
              editá-la.
            </p>

            <p className="rounded-md border border-amber-200 bg-amber-50 p-4 font-medium text-amber-900">
              A aprovação da proposta autoriza o início da construção no
              Estúdio. Ela não significa que a obra foi aprovada para
              publicação.
            </p>

            <p>
              Durante a construção, a obra permanecerá em Rascunho. Você poderá
              preencher a documentação necessária e aceitar o contrato em
              paralelo ao trabalho no Estúdio.
            </p>

            <p>
              A publicação só poderá ocorrer quando a obra estiver concluída e
              todos os requisitos necessários forem atendidos. Assim, você
              pode conhecer e experimentar o Estúdio antes de concluir toda a
              documentação.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard/autor"
              className="rounded bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Continuar
            </Link>

            <Link
              href="/dashboard"
              className="rounded border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Voltar
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
