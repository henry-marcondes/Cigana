const LivroDocumentoService = require('../services/livroDocumentoService');
const apiResponse = require('../utils/apiResponse');

function falha(res, error) { return apiResponse.error(res, error.message, error.statusCode || 500); }

class LivroDocumentoController {
    static async criar(req, res) {
        try {
            const dados = await LivroDocumentoService.criar(req.livro_id, req.query.papel || 'SECUNDARIO', req.get('X-Nome-Original'), req);
            return apiResponse.success(res, dados, 'Documento Markdown criado com sucesso.', 201);
        } catch (error) { return falha(res, error); }
    }
    static async listar(req, res) {
        try { return apiResponse.success(res, await LivroDocumentoService.listar(req.livro_id)); }
        catch (error) { return falha(res, error); }
    }
    static async principal(req, res) {
        try { return apiResponse.success(res, await LivroDocumentoService.principal(req.params.livro_id)); }
        catch (error) { return falha(res, error); }
    }
    static async promover(req, res) {
        try { return apiResponse.success(res, await LivroDocumentoService.promover(req.livro_id, req.params.arquivo_id), 'Documento principal atualizado.'); }
        catch (error) { return falha(res, error); }
    }
    static async desativar(req, res) {
        try { return apiResponse.success(res, await LivroDocumentoService.desativar(req.livro_id, req.params.arquivo_id), 'Vínculo documental desativado.'); }
        catch (error) { return falha(res, error); }
    }
    static async lerTrecho(req, res) {
        try { return apiResponse.success(res, await LivroDocumentoService.lerTrecho(req.livro_id, req.params.texto_id)); }
        catch (error) { return falha(res, error); }
    }
    static async salvar(req, res) {
        try {
            const conteudo = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body?.conteudo;
            const hash = req.get('X-Hash-Esperado') || req.body?.hash_esperado;
            return apiResponse.success(res, await LivroDocumentoService.salvar(req.livro_id, req.params.arquivo_id, conteudo, hash));
        }
        catch (error) { return falha(res, error); }
    }
}

module.exports = LivroDocumentoController;
