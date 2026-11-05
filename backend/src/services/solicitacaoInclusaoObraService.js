const pool = require('../db/connection');
const Autor = require('../models/Autor');
const Livro = require('../models/Livro');
const SolicitacaoInclusaoObra = require('../models/SolicitacaoInclusaoObra');
const LivroService = require('./livroService');

const CAMPOS_PROPOSTA = [
    'titulo', 'slug', 'resumo', 'categoria_id',
    'classificacao_indicativa_id', 'idioma_id'
];

function erro(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function erroSlugOcupado() {
    const error = erro(409, 'Este slug já está sendo utilizado por outra obra. Escolha outro slug.');
    error.errors = [{
        field: 'slug',
        code: 'SLUG_JA_UTILIZADO',
        message: 'Este slug já está sendo utilizado por outra obra. Escolha outro slug.'
    }];
    return error;
}

function normalizarSlug(slug) {
    return slug.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function validarSlugDisponivel(slug, client) {
    const slugNormalizado = normalizarSlug(slug);
    if (!slugNormalizado) {
        const error = erro(400, 'Informe um slug válido.');
        error.errors = [{ field: 'slug', code: 'SLUG_INVALIDO', message: 'Informe um slug válido.' }];
        throw error;
    }
    if (await Livro.slugJaExiste(slugNormalizado, client)) throw erroSlugOcupado();
    return slugNormalizado;
}

function proposta(dados) {
    return Object.fromEntries(CAMPOS_PROPOSTA.map((campo) => [campo, dados[campo] ?? null]));
}

class SolicitacaoInclusaoObraService {
    static async emTransacao(operacao) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const resultado = await operacao(client);
            await client.query('COMMIT');
            return resultado;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async autorDoUsuario(usuario_id) {
        const autor = await Autor.buscarPorUsuarioId(usuario_id);
        if (!autor) throw erro(403, 'Usuário não possui cadastro de Autor.');
        return autor;
    }

    static async criar(usuario_id, dados) {
        const autor = await this.autorDoUsuario(usuario_id);
        return this.emTransacao(async (client) => {
            const dadosProposta = { ...proposta(dados), slug: await validarSlugDisponivel(dados.slug, client) };
            const solicitacao = await SolicitacaoInclusaoObra.criar({
                autor_id: autor.id, ...dadosProposta
            }, client);
            await SolicitacaoInclusaoObra.adicionarHistorico(
                solicitacao.id, 'CRIADA', dadosProposta, usuario_id, null, client
            );
            return solicitacao;
        });
    }

    static async listarDoAutor(usuario_id) {
        const autor = await this.autorDoUsuario(usuario_id);
        return SolicitacaoInclusaoObra.listarPorAutor(autor.id);
    }

    static async buscarDoAutor(usuario_id, id) {
        const solicitacao = await SolicitacaoInclusaoObra.buscarPorId(id);
        if (!solicitacao) throw erro(404, 'Solicitação não encontrada.');
        if (solicitacao.usuario_id !== usuario_id) throw erro(403, 'Você não pode acessar esta solicitação.');
        solicitacao.historico = await SolicitacaoInclusaoObra.listarHistorico(id);
        return solicitacao;
    }

    static async editar(usuario_id, id, dados) {
        return this.emTransacao(async (client) => {
            const solicitacao = await SolicitacaoInclusaoObra.buscarDoAutorParaAtualizacao(id, usuario_id, client);
            if (!solicitacao) throw erro(404, 'Solicitação não encontrada para este Autor.');
            const dadosProposta = { ...proposta(dados), slug: await validarSlugDisponivel(dados.slug, client) };
            if (solicitacao.status === 'APROVADA' && !solicitacao.livro_id) {
                if (!(await Livro.slugJaExiste(solicitacao.slug, client))) {
                    throw erro(409, 'Uma solicitação aprovada só pode ser corrigida quando seu slug estiver em conflito com outra obra.');
                }
                const atualizada = await SolicitacaoInclusaoObra.atualizarPropostaAprovadaComConflito(id, dadosProposta, client);
                if (!atualizada) throw erro(409, 'A solicitação não está mais disponível para correção.');
                const motivo = `Correção da proposta após conflito confirmado de slug: ${solicitacao.slug}`;
                await SolicitacaoInclusaoObra.adicionarHistorico(id, 'EDITADA', dadosProposta, usuario_id, motivo, client);
                await SolicitacaoInclusaoObra.adicionarHistorico(id, 'REENVIADA', dadosProposta, usuario_id, motivo, client);
                return atualizada;
            }
            if (solicitacao.status !== 'RECUSADA') throw erro(409, 'Somente solicitações recusadas podem ser editadas.');
            const atualizada = await SolicitacaoInclusaoObra.atualizarProposta(id, dadosProposta, client);
            if (!atualizada) throw erro(409, 'A solicitação não está mais disponível para edição.');
            await SolicitacaoInclusaoObra.adicionarHistorico(id, 'EDITADA', dadosProposta, usuario_id, null, client);
            return atualizada;
        });
    }

    static async reenviar(usuario_id, id) {
        return this.emTransacao(async (client) => {
            const solicitacao = await SolicitacaoInclusaoObra.buscarDoAutorParaAtualizacao(id, usuario_id, client);
            if (!solicitacao) throw erro(404, 'Solicitação não encontrada para este Autor.');
            if (solicitacao.status !== 'RECUSADA') throw erro(409, 'Somente solicitações recusadas podem ser reenviadas.');
            await validarSlugDisponivel(solicitacao.slug, client);
            const reenviada = await SolicitacaoInclusaoObra.reenviar(id, client);
            if (!reenviada) throw erro(409, 'A solicitação não está mais disponível para reenvio.');
            await SolicitacaoInclusaoObra.adicionarHistorico(id, 'REENVIADA', proposta(reenviada), usuario_id, null, client);
            return reenviada;
        });
    }

    static async listarAdministrativo(status) {
        return SolicitacaoInclusaoObra.listar(status || null);
    }

    static async buscarAdministrativo(id) {
        const solicitacao = await SolicitacaoInclusaoObra.buscarPorId(id);
        if (!solicitacao) throw erro(404, 'Solicitação não encontrada.');
        solicitacao.historico = await SolicitacaoInclusaoObra.listarHistorico(id);
        return solicitacao;
    }

    static async avaliar(id, avaliador_id, aprovada, motivo = null) {
        return this.emTransacao(async (client) => {
            const solicitacao = await SolicitacaoInclusaoObra.buscarParaAvaliacao(id, client);
            if (!solicitacao) throw erro(404, 'Solicitação não encontrada.');
            if (solicitacao.status !== 'PENDENTE') throw erro(409, 'Somente solicitações pendentes podem ser avaliadas.');
            if (!aprovada && (!motivo || !motivo.trim())) throw erro(400, 'O motivo da rejeição é obrigatório.');
            if (aprovada && await Livro.slugJaExiste(solicitacao.slug, client)) throw erroSlugOcupado();
            const status = aprovada ? 'APROVADA' : 'RECUSADA';
            const resultado = await SolicitacaoInclusaoObra.avaliar(
                id, status, avaliador_id, aprovada ? null : motivo.trim(), client
            );
            if (!resultado) throw erro(409, 'A solicitação já foi avaliada.');
            await SolicitacaoInclusaoObra.adicionarHistorico(
                id, status, proposta(resultado), avaliador_id,
                aprovada ? null : motivo.trim(), client
            );
            return resultado;
        });
    }

    static async criarObraAprovada(usuario_id, id) {
        try {
            return await this.emTransacao(async (client) => {
            const solicitacao = await SolicitacaoInclusaoObra.buscarParaConsumo(id, usuario_id, client);
            if (!solicitacao) throw erro(404, 'Solicitação não encontrada para este Autor.');
            if (solicitacao.status !== 'APROVADA' || solicitacao.livro_id) {
                throw erro(409, 'Esta aprovação não está disponível ou já foi utilizada.');
            }
            if (await Livro.slugJaExiste(solicitacao.slug, client)) throw erroSlugOcupado();
            const resultado = await LivroService.criarParaAutorEmTransacao(
                usuario_id, proposta(solicitacao), client
            );
            const utilizada = await SolicitacaoInclusaoObra.marcarUtilizada(id, resultado.livro.id, client);
            if (!utilizada) throw erro(409, 'A aprovação já foi consumida.');
            await SolicitacaoInclusaoObra.adicionarHistorico(
                id, 'UTILIZADA', proposta(solicitacao), usuario_id, null, client
            );
            return { ...resultado, solicitacao: utilizada };
            });
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'uq_livros_slug') throw erroSlugOcupado();
            throw error;
        }
    }
}

module.exports = SolicitacaoInclusaoObraService;
