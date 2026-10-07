class ContratoValidator {

    // =====================================================
    // CONTRATO
    // =====================================================

    static criar(dados) {
        const erros = [];

        if (!dados || typeof dados !== 'object') {
            return ['Dados do contrato são obrigatórios.'];
        }

        if (!dados.tipo || typeof dados.tipo !== 'string') {
            erros.push('O tipo do contrato é obrigatório.');
        }

        if (!dados.codigo || typeof dados.codigo !== 'string') {
            erros.push('O código do contrato é obrigatório.');
        }

        if (!dados.nome || typeof dados.nome !== 'string') {
            erros.push('O nome do contrato é obrigatório.');
        }

        if (
            dados.descricao !== undefined &&
            dados.descricao !== null &&
            typeof dados.descricao !== 'string'
        ) {
            erros.push('A descrição do contrato deve ser um texto.');
        }

        return erros;
    }

    static atualizar(dados) {
        const erros = [];

        if (!dados || typeof dados !== 'object') {
            return ['Dados do contrato são obrigatórios.'];
        }

        if (!dados.tipo || typeof dados.tipo !== 'string') {
            erros.push('O tipo do contrato é obrigatório.');
        }

        if (!dados.codigo || typeof dados.codigo !== 'string') {
            erros.push('O código do contrato é obrigatório.');
        }

        if (!dados.nome || typeof dados.nome !== 'string') {
            erros.push('O nome do contrato é obrigatório.');
        }

        if (
            dados.descricao !== undefined &&
            dados.descricao !== null &&
            typeof dados.descricao !== 'string'
        ) {
            erros.push('A descrição do contrato deve ser um texto.');
        }

        return erros;
    }

    // =====================================================
    // VERSÃO
    // =====================================================

    static criarVersao(dados) {
        const erros = [];

        if (!dados || typeof dados !== 'object') {
            return ['Dados da versão são obrigatórios.'];
        }

        if (!dados.contrato_id || typeof dados.contrato_id !== 'string') {
            erros.push('O contrato_id é obrigatório.');
        }

        if (!dados.versao || typeof dados.versao !== 'string') {
            erros.push('A versão é obrigatória.');
        }

        if (!dados.titulo || typeof dados.titulo !== 'string') {
            erros.push('O título da versão é obrigatório.');
        }

        if (!dados.conteudo || typeof dados.conteudo !== 'string') {
            erros.push('O conteúdo da versão é obrigatório.');
        }

        return erros;
    }

    static atualizarVersao(dados) {
        const erros = [];

        if (!dados || typeof dados !== 'object') {
            return ['Dados da versão são obrigatórios.'];
        }

        if (!dados.versao || typeof dados.versao !== 'string') {
            erros.push('A versão é obrigatória.');
        }

        if (!dados.titulo || typeof dados.titulo !== 'string') {
            erros.push('O título da versão é obrigatório.');
        }

        if (!dados.conteudo || typeof dados.conteudo !== 'string') {
            erros.push('O conteúdo da versão é obrigatório.');
        }

        return erros;
    }

    // =====================================================
    // VÍNCULO COM OBRA
    // =====================================================

    static vincularObra(dados) {
        const erros = [];

        if (!dados || typeof dados !== 'object') {
            return ['Dados do vínculo são obrigatórios.'];
        }

        if (!dados.contrato_id || typeof dados.contrato_id !== 'string') {
            erros.push('O contrato_id é obrigatório.');
        }

        if (!dados.livro_id || typeof dados.livro_id !== 'string') {
            erros.push('O livro_id é obrigatório.');
        }

        return erros;
    }

    // =====================================================
    // ACEITE
    // =====================================================

    static registrarAceite(dados) {
        const erros = [];

        if (!dados || typeof dados !== 'object') {
            return ['Dados do aceite são obrigatórios.'];
        }

        if (
            !dados.contrato_versao_id ||
            typeof dados.contrato_versao_id !== 'string'
        ) {
            erros.push('O contrato_versao_id é obrigatório.');
        }

        if (!dados.livro_id || typeof dados.livro_id !== 'string') {
            erros.push('O livro_id é obrigatório.');
        }

        return erros;
    }
}

module.exports = ContratoValidator;
