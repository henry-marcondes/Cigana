const pool = require('../db/connection');
const Pessoa = require('../models/Pessoa');
const Telefone = require('../models/Telefone');

class TelefoneService {

    static criarErro(mensagem, codigo) {
        const erro = new Error(mensagem);
        erro.codigo = codigo;
        return erro;
    }

    static normalizarNumero({ codigoPais, ddd, numero }) {
        return `${codigoPais || '55'}${ddd || ''}${numero || ''}`
            .replace(/\D/g, '');
    }

    static async buscarPessoaDoUsuario(usuarioId) {
        const pessoa = await Pessoa.buscarPorUsuarioId(usuarioId);

        if (!pessoa) {
            throw this.criarErro(
                'Pessoa não encontrada.',
                'PESSOA_NAO_ENCONTRADA'
            );
        }

        return pessoa;
    }

    static async listarMeusTelefones(usuarioId) {
        const pessoa = await this.buscarPessoaDoUsuario(usuarioId);

        return Telefone.listarPorPessoaId(pessoa.id);
    }

    static async buscarMeuTelefone(usuarioId, telefoneId) {
        const pessoa = await this.buscarPessoaDoUsuario(usuarioId);

        const telefone = await Telefone.buscarPorId(telefoneId);

        if (!telefone || telefone.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Telefone não encontrado.',
                'TELEFONE_NAO_ENCONTRADO'
            );
        }

        return telefone;
    }

    static async criar(usuarioId, dados) {
        const pessoa = await this.buscarPessoaDoUsuario(usuarioId);

        const codigoPais = dados.codigo_pais || '55';
        const ddd = dados.ddd || null;

        const numeroNormalizado = this.normalizarNumero({
            codigoPais,
            ddd,
            numero: dados.numero
        });

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            if (dados.principal === true) {
                await client.query(`
                    UPDATE telefones
                    SET
                        principal = FALSE,
                        atualizado_em = NOW()
                    WHERE pessoa_id = $1
                      AND ativo = TRUE
                `, [pessoa.id]);
            }

            const telefone = await Telefone.criar({
                pessoaId: pessoa.id,
                tipo: dados.tipo,
                codigoPais,
                ddd,
                numero: dados.numero,
                numeroNormalizado,
                principal: dados.principal === true,
                verificado: false,
                client
            });

            if (!telefone) {
                throw this.criarErro(
                    'Não foi possível criar o telefone.',
                    'TELEFONE_NAO_CRIADO'
                );
            }

            await client.query('COMMIT');

            return telefone;

        } catch (error) {
            await client.query('ROLLBACK');

            if (error.code === '23505') {
                if (
                    error.constraint &&
                    error.constraint.includes('numero_normalizado')
                ) {
                    throw this.criarErro(
                        'Este número de telefone já está cadastrado para esta pessoa.',
                        'TELEFONE_JA_CADASTRADO'
                    );
                }

                if (
                    error.constraint &&
                    error.constraint.includes('principal')
                ) {
                    throw this.criarErro(
                        'Já existe um telefone principal para esta pessoa.',
                        'TELEFONE_PRINCIPAL_DUPLICADO'
                    );
                }
            }

            throw error;

        } finally {
            client.release();
        }
    }

    static async atualizar(usuarioId, telefoneId, dados) {
        const pessoa = await this.buscarPessoaDoUsuario(usuarioId);

        const telefone = await Telefone.buscarPorId(telefoneId);

        if (!telefone || telefone.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Telefone não encontrado.',
                'TELEFONE_NAO_ENCONTRADO'
            );
        }

        const codigoPais = dados.codigo_pais || '55';
        const ddd = dados.ddd || null;

        const numeroNormalizado = this.normalizarNumero({
            codigoPais,
            ddd,
            numero: dados.numero
        });

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            if (dados.principal === true) {
                await client.query(`
                    UPDATE telefones
                    SET
                        principal = FALSE,
                        atualizado_em = NOW()
                    WHERE pessoa_id = $1
                      AND ativo = TRUE
                      AND id <> $2
                `, [pessoa.id, telefoneId]);
            }

            const telefoneAtualizado = await Telefone.atualizar({
                id: telefoneId,
                pessoaId: pessoa.id,
                tipo: dados.tipo,
                codigoPais,
                ddd,
                numero: dados.numero,
                numeroNormalizado,
                principal: dados.principal === true,
                verificado: telefone.verificado,
                client
            });

            if (!telefoneAtualizado) {
                throw this.criarErro(
                    'Telefone não encontrado ou não pôde ser atualizado.',
                    'TELEFONE_NAO_ATUALIZADO'
                );
            }

            await client.query('COMMIT');

            return telefoneAtualizado;

        } catch (error) {
            await client.query('ROLLBACK');

            if (error.code === '23505') {
                if (
                    error.constraint &&
                    error.constraint.includes('numero_normalizado')
                ) {
                    throw this.criarErro(
                        'Este número de telefone já está cadastrado para esta pessoa.',
                        'TELEFONE_JA_CADASTRADO'
                    );
                }

                if (
                    error.constraint &&
                    error.constraint.includes('principal')
                ) {
                    throw this.criarErro(
                        'Já existe um telefone principal para esta pessoa.',
                        'TELEFONE_PRINCIPAL_DUPLICADO'
                    );
                }
            }

            throw error;

        } finally {
            client.release();
        }
    }

    static async definirPrincipal(usuarioId, telefoneId) {
        const pessoa = await this.buscarPessoaDoUsuario(usuarioId);

        const telefone = await Telefone.buscarPorId(telefoneId);

        if (!telefone || telefone.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Telefone não encontrado.',
                'TELEFONE_NAO_ENCONTRADO'
            );
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            await client.query(`
                UPDATE telefones
                SET
                    principal = FALSE,
                    atualizado_em = NOW()
                WHERE pessoa_id = $1
                  AND ativo = TRUE
                  AND id <> $2
            `, [pessoa.id, telefoneId]);

            const telefonePrincipal = await Telefone.definirPrincipal({
                id: telefoneId,
                pessoaId: pessoa.id,
                client
            });

            if (!telefonePrincipal) {
                throw this.criarErro(
                    'Telefone não encontrado ou não pôde ser definido como principal.',
                    'TELEFONE_NAO_ATUALIZADO'
                );
            }

            await client.query('COMMIT');

            return telefonePrincipal;

        } catch (error) {
            await client.query('ROLLBACK');

            if (error.code === '23505') {
                if (
                    error.constraint &&
                    error.constraint.includes('numero_normalizado')
                ) {
                    throw this.criarErro(
                        'Este número de telefone já está cadastrado para esta pessoa.',
                        'TELEFONE_JA_CADASTRADO'
                    );
            }

            if (
                error.constraint &&
                error.constraint.includes('principal')
            ) {
                throw this.criarErro(
                    'Já existe um telefone principal para esta pessoa.',
                    'TELEFONE_PRINCIPAL_DUPLICADO'
                );
            }
        }

        throw error;

        } finally {
            client.release();
        }
    }

    static async desativar(usuarioId, telefoneId) {
        const pessoa = await this.buscarPessoaDoUsuario(usuarioId);

        const telefone = await Telefone.buscarPorId(telefoneId);

        if (!telefone || telefone.pessoa_id !== pessoa.id) {
            throw this.criarErro(
                'Telefone não encontrado.',
                'TELEFONE_NAO_ENCONTRADO'
            );
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const telefoneDesativado = await Telefone.desativar({
                id: telefoneId,
                pessoaId: pessoa.id,
                client
            });

            if (!telefoneDesativado) {
                throw this.criarErro(
                    'Telefone não encontrado ou não pôde ser desativado.',
                    'TELEFONE_NAO_DESATIVADO'
                );
            }

            await client.query('COMMIT');

            return telefoneDesativado;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;

        } finally {
            client.release();
        }
    }
}

module.exports = TelefoneService;
