'use client';

import { useState } from 'react';
import { solicitarAlteracaoSenha } from '../../services/autenticacao';

export default function TesteAutenticacao() {
  const [resultado, setResultado] = useState(null);

  async function testar() {
    try {
      const resposta = await solicitarAlteracaoSenha(
        'bf03c86c-de36-4409-9305-ba8752edd3b2'
      );

      setResultado(resposta);
      console.log('SUCESSO:', resposta);
    } catch (error) {
      setResultado({
        success: false,
        message: error.message,
      });

      console.error('ERRO:', error);
    }
  }

  return (
    <main>
      <h1>Teste Alteração de Senha</h1>

      <button onClick={testar}>
        Solicitar Alteração
      </button>

      {resultado && (
        <pre>
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </main>
  );
}
