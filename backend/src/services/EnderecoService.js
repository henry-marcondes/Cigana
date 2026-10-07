const pool = require('../db/connection');
const Pessoa = require('../models/Pessoa');
const Endereco = require('../models/Endereco');

class EnderecoService {

    static criarErro(mensagem, codigo) {
        const erro = new Error(mensagem);
        erro.codigo = codigo;
        return erro;
    }

    static async obterPessoa(usuarioId) {
        const pessoa = await Pessoa.buscarPorUsuarioId(usuarioId);

        if (!pessoa) {
            throw this.criarErro(
                'Pessoa não encontrada.',
                'PESSOA_NAO_ENCONTRADA'
            );
        }

        return pessoa;
    }

    static async listarMeusEnderecos(usuarioId) {
        const pessoa = await this.obterPessoa(usuarioId);

        return Endereco.listarPorPessoaId(pessoa.id);
    }

    static async buscarMeuEndereco(usuarioId, enderecoId) {
        const pessoa = await this.obterPessoa(usuarioId);

        const endereco = await Endereco.buscarPorId(enderecoId);

        if (!endereco || endereco.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Endereço não encontrado.',
                'ENDERECO_NAO_ENCONTRADO'
            );
        }

        return endereco;
    }

    static async criar(usuarioId, dados) {
        const pessoa = await this.obterPessoa(usuarioId);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            /*
             * Se este endereço for definido como principal,
             * remove o principal anterior dentro da mesma transação.
             */
            if (dados.principal === true) {
                await client.query(`
                    UPDATE enderecos
                    SET
                        principal = FALSE,
                        atualizado_em = NOW()
                    WHERE pessoa_id = $1
                      AND ativo = TRUE
                `, [pessoa.id]);
            }

            const endereco = await Endereco.criar({
                pessoaId: pessoa.id,
                tipo: dados.tipo,
                cep: dados.cep,
                logradouro: dados.logradouro,
                numero: dados.numero,
                complemento: dados.complemento || null,
                bairro: dados.bairro,
                cidade: dados.cidade,
                uf: dados.uf,
                pais: dados.pais || 'Brasil',
                principal: dados.principal || false,
                client
            });

            await client.query('COMMIT');

            return endereco;

        } catch (error) {
            await client.query('ROLLBACK');

            if (
                error.code === '23505' &&
                error.constraint &&
                error.constraint.includes('principal')
            ) {
                throw this.criarErro(
                    'Já existe um endereço principal para esta pessoa.',
                    'ENDERECO_PRINCIPAL_DUPLICADO'
                );
            }

            throw error;

        } finally {
            client.release();
        }
    }

    static async atualizar(usuarioId, enderecoId, dados) {
        const pessoa = await this.obterPessoa(usuarioId);

        const endereco = await Endereco.buscarPorId(enderecoId);

        if (!endereco || endereco.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Endereço não encontrado.',
                'ENDERECO_NAO_ENCONTRADO'
            );
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            if (dados.principal === true) {
                await client.query(`
                    UPDATE enderecos
                    SET
                        principal = FALSE,
                        atualizado_em = NOW()
                    WHERE pessoa_id = $1
                      AND ativo = TRUE
                `, [pessoa.id]);
            }

            const enderecoAtualizado = await Endereco.atualizar({
                id: enderecoId,
                pessoaId: pessoa.id,
                tipo: dados.tipo,
                cep: dados.cep,
                logradouro: dados.logradouro,
                numero: dados.numero,
                complemento: dados.complemento || null,
                bairro: dados.bairro,
                cidade: dados.cidade,
                uf: dados.uf,
                pais: dados.pais || 'Brasil',
                principal: dados.principal || false,
                client
            });

            if (!enderecoAtualizado) {
                throw this.criarErro(
                    'Endereço não encontrado ou inativo.',
                    'ENDERECO_NAO_ENCONTRADO'
                );
            }

            await client.query('COMMIT');

            return enderecoAtualizado;

        } catch (error) {
            await client.query('ROLLBACK');

            if (
                error.code === '23505' &&
                error.constraint &&
                error.constraint.includes('principal')
            ) {
                throw this.criarErro(
                    'Já existe um endereço principal para esta pessoa.',
                    'ENDERECO_PRINCIPAL_DUPLICADO'
                );
            }

            throw error;

        } finally {
            client.release();
        }
    }

    static async definirPrincipal(usuarioId, enderecoId) {
        const pessoa = await this.obterPessoa(usuarioId);

        const endereco = await Endereco.buscarPorId(enderecoId);

        if (!endereco || endereco.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Endereço não encontrado.',
                'ENDERECO_NAO_ENCONTRADO'
            );
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const enderecoPrincipal = await Endereco.definirPrincipal({
                id: enderecoId,
                pessoaId: pessoa.id,
                client
            });

            if (!enderecoPrincipal) {
                throw this.criarErro(
                    'Endereço não encontrado ou inativo.',
                    'ENDERECO_NAO_ENCONTRADO'
                );
            }

            await client.query('COMMIT');

            return enderecoPrincipal;

        } catch (error) {
            await client.query('ROLLBACK');

            if (
                error.code === '23505' &&
                error.constraint &&
                error.constraint.includes('principal')
            ) {
                throw this.criarErro(
                    'Já existe um endereço principal para esta pessoa.',
                    'ENDERECO_PRINCIPAL_DUPLICADO'
                );
            }

            throw error;

        } finally {
            client.release();
        }
    }

    static async desativar(usuarioId, enderecoId) {
        const pessoa = await this.obterPessoa(usuarioId);

        const endereco = await Endereco.buscarPorId(enderecoId);

        if (!endereco || endereco.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Endereço não encontrado.',
                'ENDERECO_NAO_ENCONTRADO'
            );
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const enderecoDesativado = await Endereco.desativar({
                id: enderecoId,
                pessoaId: pessoa.id,
                client
            });

            if (!enderecoDesativado) {
                throw this.criarErro(
                    'Endereço não encontrado ou inativo.',
                    'ENDERECO_NAO_ENCONTRADO'
                );
            }

            await client.query('COMMIT');

            return enderecoDesativado;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;

        } finally {
            client.release();
        }
    }
}

module.exports = EnderecoService;
