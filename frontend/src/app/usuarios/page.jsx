import { apiFetch } from '../../services/api';

export default async function UsuariosPage() {
  const resposta = await apiFetch('/api/usuarios');
  const usuarios = resposta.data;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Usuários
      </h1>

      <div className="space-y-4">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="rounded-lg border border-gray-200 p-4"
          >
            <p className="font-medium">
              {usuario.email}
            </p>

            <p className="text-sm text-gray-500">
              ID: {usuario.id}
            </p>

            <p className="text-sm">
              Status:{' '}
              {usuario.ativo ? 'Ativo' : 'Desativado'}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
