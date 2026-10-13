const crypto = require('crypto');

const TokenUsuario = require('../models/TokenUsuario');
const Usuario = require('../models/Usuario');
const EmailService = require('./EmailService');
const ContratoVersao = require('../models/ContratoVersao');
const ContratoObra = require('../models/ContratoObra');
const Contrato = require('../models/Contrato');
const LivroAutor = require('../models/LivroAutor');

const FINALIDADES = {
    VERIFICACAO_EMAIL: 'VERIFICACAO_EMAIL',
    ALTERACAO_SENHA: 'ALTERACAO_SENHA',
    RECUPERACAO_SENHA: 'RECUPERACAO_SENHA',
    ACEITE_CONTRATO: 'ACEITE_CONTRATO'
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
        finalidade,
        dados_adicionais = null
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
            expira_em,
            dados_adicionais
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

    static async solicitarCodigoAceite({
        usuario_id,
        contrato_versao_id,
        livro_id
    }) {
        const finalidade = FINALIDADES.ACEITE_CONTRATO;
        const usuario = await Usuario.buscarPorId(usuario_id);

        if (!usuario) {
            const erro = new Error('Usuário não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }
        if (!usuario.email) {
            const erro = new Error('O usuário não possui e-mail cadastrado.');
            erro.statusCode = 409;
            throw erro;
        }

        const versao = await ContratoVersao.buscarPorId(contrato_versao_id);
        if (!versao) {
            const erro = new Error('Versão do contrato não encontrada.');
            erro.statusCode = 404;
            throw erro;
        }
        if (versao.status !== 'ATIVA') {
            const erro = new Error('Somente uma versão ativa pode ser aceita.');
            erro.statusCode = 409;
            throw erro;
        }

        const contrato = await Contrato.buscarPorId(versao.contrato_id);
        if (!contrato) {
            const erro = new Error('Contrato da versão não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        if (contrato.tipo === 'DIREITOS_AUTORAIS') {
            if (!contrato.ativo) {
                const erro = new Error('O contrato de Direitos Autorais está inativo.');
                erro.statusCode = 409;
                throw erro;
            }

            const ehAutor = await LivroAutor.usuarioEhAutorDaObra(
                usuario_id,
                livro_id
            );
            if (!ehAutor) {
                const erro = new Error('Obra não encontrada ou não autorizada.');
                erro.statusCode = 404;
                throw erro;
            }
        } else {
            const vinculo = await ContratoObra.buscarPorContratoELivro(
                versao.contrato_id,
                livro_id
            );
            if (!vinculo) {
                const erro = new Error(
                    'A obra não está vinculada ao contrato desta versão.'
                );
                erro.statusCode = 409;
                throw erro;
            }
        }

        const tokenAnterior = await TokenUsuario.buscarAtivo(
            usuario_id,
            finalidade
        );
        if (tokenAnterior) {
            await TokenUsuario.desativar(tokenAnterior.id);
        }

        const token = this.gerarToken();
        const registro = await TokenUsuario.criar({
            usuario_id,
            finalidade,
            token_hash: this.gerarHash(token),
            expira_em: this.calcularExpiracao(),
            dados_adicionais: {
                usuario_id,
                contrato_versao_id,
                livro_id
            }
        });

        await EmailService.enviar({
            para: usuario.email,
            assunto: 'Código para confirmar o aceite do contrato',
            texto: `Olá,\n\nVocê solicitou a confirmação do aceite eletrônico de um contrato na Plataforma Cigana.\n\nCódigo de confirmação:\n${token}\n\nDigite este código na Plataforma Cigana para confirmar o seu aceite.\n\nEste código é pessoal, temporário e deve ser utilizado somente por você.\n\nSe você não solicitou esta confirmação, não informe o código a ninguém e desconsidere esta mensagem.\n\nAtenciosamente,\n\nPlataforma Cigana`,
            html: `<p>Olá,</p><p>Você solicitou a confirmação do aceite eletrônico de um contrato na Plataforma Cigana.</p><p><strong>Código de confirmação:</strong></p><h1>${token}</h1><p>Digite este código na Plataforma Cigana para confirmar o seu aceite.</p><p>Este código é pessoal, temporário e deve ser utilizado somente por você.</p><p>Se você não solicitou esta confirmação, não informe o código a ninguém e desconsidere esta mensagem.</p><p>Atenciosamente,<br>Plataforma Cigana</p>`
        });

        return {
            id: registro.id,
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
