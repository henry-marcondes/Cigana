import { apiFetch } from '../../../services/api';

export default function NovoUsuarioPage() {
  async function criarUsuario(formData) {
    'use server';

    const email = formData.get('email');
    const senha = formData.get('senha');

    await apiFetch('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify({
        email,
        senha,
      }),
    });
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Novo Usuário
      </h1>

      <form action={criarUsuario} className="space-y-4">
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
            required
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <div>
          <label
            htmlFor="senha"
            className="mb-1 block font-medium"
          >
            Senha
          </label>

          <input
            id="senha"
            name="senha"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 font-medium text-white"
        >
          Criar usuário
        </button>
      </form>
    </main>
  );
}
