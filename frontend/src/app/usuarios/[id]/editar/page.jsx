import { apiFetch } from '../../../../services/api';

export default async function EditarUsuarioPage({ params }) {
  const { id } = await params;

  const resposta = await apiFetch(`/api/usuarios/${id}`);
  const usuario = resposta.data;

  async function atualizarUsuario(formData) {
    'use server';

    const email = formData.get('email');

    await apiFetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        email,
      }),
    });
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Alterar Usuário
      </h1>

      <form action={atualizarUsuario} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block font-medium"
          >
            E-mail
          </label>

          <input
            id="email"
            name="email"
            type="email"
            defaultValue={usuario.email}
            required
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 font-medium text-white"
        >
          Salvar alterações
        </button>
      </form>
    </main>
  );
}
