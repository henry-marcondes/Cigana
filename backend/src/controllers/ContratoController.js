const ContratoService = require('../services/ContratoService');
const ContratoValidator = require('../validators/ContratoValidator');
const { success, error } = require('../utils/apiResponse');

function validar(erros, res) {
    if (erros.length > 0) {
        error(
            res,
            'Dados inválidos.',
            400,
            erros
        );
        return false;
    }

    return true;
}

class ContratoController {

    // =====================================================
    // CONTRATO
    // =====================================================

    static async listar(req, res) {
        try {
            const filtros = {};

            if (req.query.ativo !== undefined) {
                filtros.ativo = req.query.ativo === 'true';
            }

            if (req.query.tipo) {
                filtros.tipo = req.query.tipo;
            }

            const contratos = await ContratoService.listar(filtros);

            return success(res, contratos);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar contratos.',
                err.statusCode || 500
            );
        }
    }

    static async buscarPorId(req, res) {
        try {
            const contrato = await ContratoService.buscarPorId(req.params.id);

            return success(res, contrato);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar contrato.',
                err.statusCode || 500
            );
        }
    }

    static async buscarPorCodigo(req, res) {
        try {
            const contrato =
                await ContratoService.buscarPorCodigo(req.params.codigo);

            return success(res, contrato);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar contrato.',
                err.statusCode || 500
            );
        }
    }

    static async criar(req, res) {
        try {
            const erros = ContratoValidator.criar(req.body);

            if (!validar(erros, res)) {
                return;
            }

            const contrato = await ContratoService.criar(req.body);

            return success(
                res,
                contrato,
                'Contrato criado com sucesso.',
                201
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao criar contrato.',
                err.statusCode || 500
            );
        }
    }

    static async atualizar(req, res) {
        try {
            const erros = ContratoValidator.atualizar(req.body);

            if (!validar(erros, res)) {
                return;
            }

            const contrato = await ContratoService.atualizar(
                req.params.id,
                req.body
            );

            return success(
                res,
                contrato,
                'Contrato atualizado com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao atualizar contrato.',
                err.statusCode || 500
            );
        }
    }

    static async ativar(req, res) {
        try {
            const contrato = await ContratoService.ativar(req.params.id);

            return success(
                res,
                contrato,
                'Contrato ativado com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao ativar contrato.',
                err.statusCode || 500
            );
        }
    }

    static async desativar(req, res) {
        try {
            const contrato = await ContratoService.desativar(req.params.id);

            return success(
                res,
                contrato,
                'Contrato desativado com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao desativar contrato.',
                err.statusCode || 500
            );
        }
    }

    // =====================================================
    // VERSÕES
    // =====================================================

    static async listarVersoes(req, res) {
        try {
            const versoes =
                await ContratoService.listarVersoes(req.params.contratoId);

            return success(res, versoes);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar versões.',
                err.statusCode || 500
            );
        }
    }

    static async buscarVersaoPorId(req, res) {
        try {
            const versao =
                await ContratoService.buscarVersaoPorId(req.params.id);

            return success(res, versao);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar versão.',
                err.statusCode || 500
            );
        }
    }

    static async buscarVersaoAtiva(req, res) {
        try {
            const versao =
                await ContratoService.buscarVersaoAtiva(
                    req.params.contratoId
                );

            return success(res, versao);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar versão ativa.',
                err.statusCode || 500
            );
        }
    }

    static async criarVersao(req, res) {
        try {
            const dados = {
                ...req.body,
                contrato_id: req.params.contratoId
            };

            const erros = ContratoValidator.criarVersao(dados);

            if (!validar(erros, res)) {
                return;
            }

            const versao = await ContratoService.criarVersao(
                req.params.contratoId,
                dados
            );

            return success(
                res,
                versao,
                'Versão criada com sucesso.',
                201
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao criar versão.',
                err.statusCode || 500
            );
        }
    }

    static async atualizarVersao(req, res) {
        try {
            const erros =
                ContratoValidator.atualizarVersao(req.body);

            if (!validar(erros, res)) {
                return;
            }

            const versao = await ContratoService.atualizarVersao(
                req.params.id,
                req.body
            );

            return success(
                res,
                versao,
                'Versão atualizada com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao atualizar versão.',
                err.statusCode || 500
            );
        }
    }

    static async publicarVersao(req, res) {
        try {
            const versao =
                await ContratoService.publicarVersao(req.params.id);

            return success(
                res,
                versao,
                'Versão publicada com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao publicar versão.',
                err.statusCode || 500
            );
        }
    }

    static async encerrarVersao(req, res) {
        try {
            const versao =
                await ContratoService.encerrarVersao(req.params.id);

            return success(
                res,
                versao,
                'Versão encerrada com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao encerrar versão.',
                err.statusCode || 500
            );
        }
    }

    // =====================================================
    // VÍNCULO COM OBRAS
    // =====================================================

    static async listarObrasPorContrato(req, res) {
        try {
            const vinculos =
                await ContratoService.listarObrasPorContrato(
                    req.params.contratoId
                );

            return success(res, vinculos);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar obras do contrato.',
                err.statusCode || 500
            );
        }
    }

    static async listarContratosPorObra(req, res) {
        try {
            const contratos =
                await ContratoService.listarContratosPorObra(
                    req.params.livroId
                );

            return success(res, contratos);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar contratos da obra.',
                err.statusCode || 500
            );
        }
    }

    static async buscarContratoObraPorId(req, res) {
        try {
            const vinculo =
                await ContratoService.buscarContratoObraPorId(
                    req.params.id
                );

            return success(res, vinculo);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar vínculo.',
                err.statusCode || 500
            );
        }
    }

    static async vincularObra(req, res) {
        try {
            const dados = {
                contrato_id: req.params.contratoId,
                livro_id: req.body.livro_id
            };

            const erros = ContratoValidator.vincularObra(dados);

            if (!validar(erros, res)) {
                return;
            }

            const vinculo =
                await ContratoService.vincularObra(
                    dados.contrato_id,
                    dados.livro_id
                );

            return success(
                res,
                vinculo,
                'Contrato vinculado à obra com sucesso.',
                201
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao vincular contrato à obra.',
                err.statusCode || 500
            );
        }
    }

    static async desvincularObra(req, res) {
        try {
            const vinculo =
                await ContratoService.desvincularObra(req.params.id);

            return success(
                res,
                vinculo,
                'Contrato desvinculado da obra com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao desvincular contrato da obra.',
                err.statusCode || 500
            );
        }
    }

    // =====================================================
    // ACEITES
    // =====================================================

    static async listarAceitesPorUsuario(req, res) {
        try {
            const aceites =
                await ContratoService.listarAceitesPorUsuario(
                    req.params.usuarioId
                );

            return success(res, aceites);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar aceites do usuário.',
                err.statusCode || 500
            );
        }
    }

    static async listarAceitesPorVersao(req, res) {
        try {
            const aceites =
                await ContratoService.listarAceitesPorVersao(
                    req.params.contratoVersaoId
                );

            return success(res, aceites);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar aceites da versão.',
                err.statusCode || 500
            );
        }
    }

    static async buscarAceitePorId(req, res) {
        try {
            const aceite =
                await ContratoService.buscarAceitePorId(
                    req.params.id
                );

            return success(res, aceite);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar aceite.',
                err.statusCode || 500
            );
        }
    }

    static async verificarAceite(req, res) {
        try {
            const aceite =
                await ContratoService.verificarAceite(
                    req.params.usuarioId,
                    req.params.contratoVersaoId
                );

            return success(res, aceite);
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao verificar aceite.',
                err.statusCode || 500
            );
        }
    }

    static async registrarAceite(req, res) {
        try {
            const dados = {
                contrato_versao_id: req.params.contratoVersaoId,
                livro_id: req.body.livro_id
            };

            const erros =
                ContratoValidator.registrarAceite(dados);

            if (!validar(erros, res)) {
                return;
            }

            /*
             * O usuário autenticado deve vir do middleware de autenticação.
             * Não recebemos usuario_id do corpo da requisição.
             */
            const usuarioId = req.usuario.id;

            const aceite =
                await ContratoService.registrarAceite(
                    usuarioId,
                    req.params.contratoVersaoId,
                    dados.livro_id,
                    {
                        ip_origem: req.ip,
                        user_agent: req.get('user-agent'),
                        dados_tecnicos: req.body.dados_tecnicos
                    }
                );

            return success(
                res,
                aceite,
                'Contrato aceito com sucesso.',
                201
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao registrar aceite.',
                err.statusCode || 500
            );
        }
    }
}

module.exports = ContratoController;
