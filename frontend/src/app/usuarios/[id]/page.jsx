import { apiFetch } from '../../../services/api';

export default async function UsuarioPage({ params }) {
  const { id } = await params;

  const resposta = await apiFetch(`/api/usuarios/${id}`);
  const usuario = resposta.data;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Usuário
      </h1>

      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <div>
          <p className="text-sm text-gray-500">
            E-mail
          </p>

          <p className="font-medium">
            {usuario.email}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p>
            {usuario.ativo ? 'Ativo' : 'Desativado'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            E-mail verificado
          </p>

          <p>
            {usuario.email_verificado_em
              ? usuario.email_verificado_em
              : 'Não verificado'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Último login
          </p>

          <p>
            {usuario.ultimo_login_em
              ? usuario.ultimo_login_em
              : 'Nenhum login registrado'}
          </p>
        </div>
      </div>
    </main>
  );
}
