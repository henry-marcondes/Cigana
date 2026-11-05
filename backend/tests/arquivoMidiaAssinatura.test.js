const assert = require('node:assert/strict');
const test = require('node:test');

const segredoOriginal = process.env.CIGANA_MEDIA_URL_SECRET;
const jwtOriginal = process.env.JWT_SECRET;
process.env.CIGANA_MEDIA_URL_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';
const assinaturaMidia = require('../src/utils/arquivoMidiaAssinatura');

test.after(() => {
    if (segredoOriginal === undefined) delete process.env.CIGANA_MEDIA_URL_SECRET;
    else process.env.CIGANA_MEDIA_URL_SECRET = segredoOriginal;
    if (jwtOriginal === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = jwtOriginal;
});

test('URL assinada fica vinculada ao arquivo e expira em 30 minutos', () => {
    const arquivoId = '11111111-1111-4111-8111-111111111111';
    const agora = 2_000_000_000;
    const emitida = assinaturaMidia.emitir(arquivoId, agora);

    assert.equal(emitida.expiracao, agora + 1800);
    assert.deepEqual(
        assinaturaMidia.validar(arquivoId, emitida.expiracao, emitida.assinatura, agora),
        { valido: true, expirado: false }
    );
    assert.equal(
        assinaturaMidia.validar('22222222-2222-4222-8222-222222222222', emitida.expiracao, emitida.assinatura, agora).valido,
        false
    );
});

test('assinatura inválida e expirada são distinguidas', () => {
    const emitida = assinaturaMidia.emitir(
        '11111111-1111-4111-8111-111111111111',
        2_000_000_000
    );

    assert.equal(
        assinaturaMidia.validar('11111111-1111-4111-8111-111111111111', emitida.expiracao, 'x'.repeat(43), 2_000_000_000).valido,
        false
    );
    assert.deepEqual(
        assinaturaMidia.validar('11111111-1111-4111-8111-111111111111', emitida.expiracao, emitida.assinatura, emitida.expiracao),
        { valido: false, expirado: true }
    );
});
