import {
  criarToken,
  validarToken,
  invalidarToken,
} from '../services/autenticacao';

async function teste() {
  try {
    console.log('=== TESTE criarToken ===');

    const criado = await criarToken(
      'COLOQUE_AQUI_UM_USUARIO_ID_VALIDO',
      'RECUPERACAO_SENHA'
    );

    console.log(criado);

    console.log('=== TESTE validarToken ===');

    const validado = await validarToken(
      'COLOQUE_AQUI_UM_USUARIO_ID_VALIDO',
      'TOKEN_DE_TESTE',
      'RECUPERACAO_SENHA'
    );

    console.log(validado);

    console.log('=== TESTE invalidarToken ===');

    const invalidado = await invalidarToken(
      'ID_DO_TOKEN'
    );

    console.log(invalidado);

  } catch (error) {
    console.error('ERRO:', error.message);
  }
}

teste();
