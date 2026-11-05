const crypto = require('node:crypto');

const DURACAO_SEGUNDOS = 30 * 60;

function obterSegredo() {
    const segredo = process.env.CIGANA_MEDIA_URL_SECRET || process.env.JWT_SECRET;
    if (!segredo || segredo.length < 32) {
        throw new Error('CIGANA_MEDIA_URL_SECRET deve conter ao menos 32 caracteres.');
    }
    return segredo;
}

function gerarAssinatura(arquivo_id, expiracao) {
    const chaveDerivada = crypto.createHmac('sha256', obterSegredo())
        .update('Cigana arquivo de mídia assinado v1')
        .digest();
    return crypto.createHmac('sha256', chaveDerivada)
        .update(`${arquivo_id}.${expiracao}`)
        .digest('base64url');
}

function emitir(arquivo_id, agora = Math.floor(Date.now() / 1000)) {
    const expiracao = agora + DURACAO_SEGUNDOS;
    return { expiracao, assinatura: gerarAssinatura(arquivo_id, expiracao) };
}

function validar(arquivo_id, expiracao, assinatura, agora = Math.floor(Date.now() / 1000)) {
    if (!/^\d+$/.test(String(expiracao || '')) || !/^[A-Za-z0-9_-]{43}$/.test(assinatura || '')) {
        return { valido: false, expirado: false };
    }
    if (Number(expiracao) <= agora) return { valido: false, expirado: true };
    const esperada = Buffer.from(gerarAssinatura(arquivo_id, Number(expiracao)));
    const recebida = Buffer.from(assinatura);
    return {
        valido: recebida.length === esperada.length && crypto.timingSafeEqual(recebida, esperada),
        expirado: false
    };
}

module.exports = { DURACAO_SEGUNDOS, emitir, validar };
