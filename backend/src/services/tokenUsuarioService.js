const crypto = require('crypto');

const TokenUsuario = require('../models/TokenUsuario');
const Usuario = require('../models/Usuario');
const EmailService = require('./EmailService');

const FINALIDADES = {
    VERIFICACAO_EMAIL: 'VERIFICACAO_EMAIL',
    ALTERACAO_SENHA: 'ALTERACAO_SENHA',
    RECUPERACAO_SENHA: 'RECUPERACAO_SENHA'
};

const VALIDADE_MINUTOS = 10;
const MAX_TENTATIVAS = 5;

class TokenUsuarioService {

    static gerarToken() {
        return crypto
            .randomInt(0, 1000000)
            .toString()
            .padStart(6, '0');
    }

    static gerarHash(token) {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    static validarFinalidade(finalidade) {
        return Object.values(FINALIDADES).includes(finalidade);
    }

    static calcularExpiracao() {
        const expiraEm = new Date();

        expiraEm.setMinutes(
            expiraEm.getMinutes() + VALIDADE_MINUTOS
        );

        return expiraEm;
    }

    static async criar({
        usuario_id,
        finalidade
    }) {
        if (!usuario_id) {
            throw new Error('ID do usuário é obrigatório.');
        }

        if (!this.validarFinalidade(finalidade)) {
            throw new Error('Finalidade do token inválida.');
        }

        const usuario = await Usuario.buscarPorId(usuario_id);

        if (!usuario) {
            throw new Error('Usuário não encontrado.');
        }

        const tokenAnterior = await TokenUsuario.buscarAtivo(
            usuario_id,
            finalidade
        );

        if (tokenAnterior) {
            await TokenUsuario.desativar(tokenAnterior.id);
        }

        const token = this.gerarToken();

        const token_hash = this.gerarHash(token);

        const expira_em = this.calcularExpiracao();

        const registro = await TokenUsuario.criar({
            usuario_id,
            finalidade,
            token_hash,
            expira_em
        });

        await EmailService.enviar({
            para: usuario.email,
            assunto: 'Código de segurança — Ciganas',
            texto: `
Seu código de segurança é: ${token}

Este código é válido por ${VALIDADE_MINUTOS} minutos.
            `,
            html: `
                <h2>Ciganas</h2>

                <p>Seu código de segurança é:</p>

                <h1>${token}</h1>

                <p>
                    Este código é válido por
                    <strong>${VALIDADE_MINUTOS} minutos</strong>.
                </p>

                <p>
                    Não compartilhe este código com ninguém.
                </p>
            `
        });

        return {
            id: registro.id,
            usuario_id: registro.usuario_id,
            finalidade: registro.finalidade,
            expira_em: registro.expira_em
        };
    }

    static async validar({
        usuario_id,
        finalidade,
        token
    }) {
        if (!usuario_id) {
            throw new Error('ID do usuário é obrigatório.');
        }

        if (!this.validarFinalidade(finalidade)) {
            throw new Error('Finalidade do token inválida.');
        }

        if (!token || !/^\d{6}$/.test(token)) {
            throw new Error('Token deve conter 6 dígitos.');
        }

        const registro = await TokenUsuario.buscarAtivo(
            usuario_id,
            finalidade
        );

        if (!registro) {
            throw new Error('Token inválido ou inexistente.');
        }

        if (new Date() > new Date(registro.expira_em)) {
            await TokenUsuario.desativar(registro.id);

            throw new Error('Token expirado.');
        }

        if (registro.tentativas >= MAX_TENTATIVAS) {
            await TokenUsuario.desativar(registro.id);

            throw new Error('Limite de tentativas excedido.');
        }

        const token_hash = this.gerarHash(token);

        if (token_hash !== registro.token_hash) {
            const atualizado = await TokenUsuario.incrementarTentativas(
                registro.id
            );

            if (atualizado.tentativas >= MAX_TENTATIVAS) {
                await TokenUsuario.desativar(registro.id);

                throw new Error('Limite de tentativas excedido.');
            }

            throw new Error('Token inválido.');
        }

        return TokenUsuario.marcarComoUsado(registro.id);
    }

    static async invalidar({
        usuario_id,
        finalidade
    }) {
        if (!usuario_id) {
            throw new Error('ID do usuário é obrigatório.');
        }

        if (!this.validarFinalidade(finalidade)) {
            throw new Error('Finalidade do token inválida.');
        }

        const registro = await TokenUsuario.buscarAtivo(
            usuario_id,
            finalidade
        );

        if (!registro) {
            return null;
        }

        return TokenUsuario.desativar(registro.id);
    }
}

module.exports = {
    TokenUsuarioService,
    FINALIDADES,
    VALIDADE_MINUTOS,
    MAX_TENTATIVAS
};
