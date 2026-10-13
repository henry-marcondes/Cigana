const pool = require('../db/connection');
const Pessoa = require('../models/Pessoa');
const PessoaFisica = require('../models/PessoaFisica');
const PessoaJuridica = require('../models/PessoaJuridica');
const Telefone = require('../models/Telefone');
const Endereco = require('../models/Endereco');
const { validarCpf, validarCnpj } = require('../validators/PessoaValidator');

function possuiEspecializacao(dados, campo) {
    return dados?.[campo] !== undefined && dados[campo] !== null;
}

function mapearDadosPessoaFisica(dados = {}) {
    return {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        dataNascimento: dados.data_nascimento,
        cpf: dados.cpf,
        rg: dados.rg,
        orgaoExpedidorRg: dados.orgao_expedidor_rg,
        ufExpedidorRg: dados.uf_expedidor_rg
    };
}

function mapearDadosPessoaJuridica(dados = {}) {
    return {
        razaoSocial: dados.razao_social,
        nomeFantasia: dados.nome_fantasia,
        cnpj: dados.cnpj,
        inscricaoEstadual: dados.inscricao_estadual,
        inscricaoMunicipal: dados.inscricao_municipal
    };
}

class PessoaService {

    static async buscarMinhaPessoa(usuarioId) {
        const pessoa = await Pessoa.buscarPorUsuarioId(usuarioId);

        if (!pessoa) {
            return null;
        }

        const [pessoaFisica, pessoaJuridica] = await Promise.all([
            PessoaFisica.buscarPorPessoaId(pessoa.id),
            PessoaJuridica.buscarPorPessoaId(pessoa.id)
        ]);

        return {
            ...pessoa,
            pessoa_fisica: pessoaFisica,
            pessoa_juridica: pessoaJuridica
        };
    }

    static async verificarRegularizacao(usuarioId) {
        const pendencias = [];
        const adicionarPendencia = (requisito, mensagem) => {
            pendencias.push({ requisito, mensagem });
        };

        const pessoa = await Pessoa.buscarPorUsuarioId(usuarioId);

        if (!pessoa) {
            adicionarPendencia('pessoa', 'Cadastro de pessoa não encontrado.');
            adicionarPendencia(
                'especializacao',
                'Cadastre uma especialização de pessoa física ou jurídica.'
            );
            adicionarPendencia('telefone', 'Cadastre ao menos um telefone ativo.');
            adicionarPendencia('endereco', 'Cadastre ao menos um endereço ativo.');

            return { regularizado: false, pendencias };
        }

        const [pessoaFisica, pessoaJuridica, telefones, enderecos] =
            await Promise.all([
                PessoaFisica.buscarPorPessoaId(pessoa.id),
                PessoaJuridica.buscarPorPessoaId(pessoa.id),
                Telefone.listarPorPessoaId(pessoa.id),
                Endereco.listarPorPessoaId(pessoa.id)
            ]);

        const tiposExigidos = new Set();

        if (pessoa.tipo_pessoa === 'FISICA') {
            tiposExigidos.add('FISICA');
        } else if (pessoa.tipo_pessoa === 'JURIDICA') {
            tiposExigidos.add('JURIDICA');
        } else {
            adicionarPendencia('tipo_pessoa', 'Tipo de pessoa não definido ou inválido.');
        }

        // Uma especialização já cadastrada também faz parte da regularização,
        // mesmo quando a outra é o tipo principal registrado na Pessoa.
        if (pessoaFisica) tiposExigidos.add('FISICA');
        if (pessoaJuridica) tiposExigidos.add('JURIDICA');

        if (tiposExigidos.has('FISICA')) {
            if (!pessoaFisica) {
                adicionarPendencia('pessoa_fisica', 'Cadastro de pessoa física não encontrado.');
            } else {
                if (!pessoaFisica.nome?.trim()) {
                    adicionarPendencia('pessoa_fisica.nome', 'Nome é obrigatório.');
                }
                if (!pessoaFisica.sobrenome?.trim()) {
                    adicionarPendencia('pessoa_fisica.sobrenome', 'Sobrenome é obrigatório.');
                }
                if (!validarCpf(pessoaFisica.cpf)) {
                    adicionarPendencia('pessoa_fisica.cpf', 'CPF ausente ou inválido.');
                }
            }
        }

        if (tiposExigidos.has('JURIDICA')) {
            if (!pessoaJuridica) {
                adicionarPendencia('pessoa_juridica', 'Cadastro de pessoa jurídica não encontrado.');
            } else {
                if (!pessoaJuridica.razao_social?.trim()) {
                    adicionarPendencia('pessoa_juridica.razao_social', 'Razão social é obrigatória.');
                }
                if (!validarCnpj(pessoaJuridica.cnpj)) {
                    adicionarPendencia('pessoa_juridica.cnpj', 'CNPJ ausente ou inválido.');
                }
            }
        }

        if (tiposExigidos.size === 0) {
            adicionarPendencia('especializacao', 'Cadastre uma especialização de pessoa física ou jurídica.');
        }

        if (telefones.length === 0) {
            adicionarPendencia('telefone', 'Cadastre ao menos um telefone ativo.');
        }

        if (enderecos.length === 0) {
            adicionarPendencia('endereco', 'Cadastre ao menos um endereço ativo.');
        }

        return {
            regularizado: pendencias.length === 0,
            pendencias
        };
    }

    static async criar(usuarioId, dados) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const pessoaExistente = await Pessoa.buscarPorUsuarioId(usuarioId);

            if (pessoaExistente) {
                const erro = new Error('PESSOA_JA_CADASTRADA');
                erro.codigo = 'PESSOA_JA_CADASTRADA';
                throw erro;
            }

            const temPessoaFisica = possuiEspecializacao(dados, 'pessoa_fisica');
            const temPessoaJuridica = possuiEspecializacao(dados, 'pessoa_juridica');

            if (!temPessoaFisica && !temPessoaJuridica) {
                const erro = new Error('ESPECIALIZACAO_OBRIGATORIA');
                erro.codigo = 'ESPECIALIZACAO_OBRIGATORIA';
                throw erro;
            }

            const tipoPessoa = dados.tipo_pessoa || (
                temPessoaFisica && !temPessoaJuridica
                    ? 'FISICA'
                    : !temPessoaFisica && temPessoaJuridica
                        ? 'JURIDICA'
                        : null
            );

            const pessoa = await Pessoa.criar({
                usuarioId,
                tipoPessoa,
                client
            });

            let pessoaFisica = null;
            let pessoaJuridica = null;

            if (temPessoaFisica) {
                pessoaFisica = await PessoaFisica.criar({
                    pessoaId: pessoa.id,
                    ...mapearDadosPessoaFisica(dados.pessoa_fisica),
                    client
                });
            }

            if (temPessoaJuridica) {
                pessoaJuridica = await PessoaJuridica.criar({
                    pessoaId: pessoa.id,
                    ...mapearDadosPessoaJuridica(dados.pessoa_juridica),
                    client
                });
            }

            await client.query('COMMIT');

            return {
                ...pessoa,
                pessoa_fisica: pessoaFisica,
                pessoa_juridica: pessoaJuridica
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;

        } finally {
            client.release();
        }
    }

    static async atualizar(usuarioId, dados) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const pessoa = await Pessoa.buscarPorUsuarioId(usuarioId, client);

            if (!pessoa) {
                const erro = new Error('PESSOA_NAO_ENCONTRADA');
                erro.codigo = 'PESSOA_NAO_ENCONTRADA';
                throw erro;
            }

            const temPessoaFisica = possuiEspecializacao(dados, 'pessoa_fisica');
            const temPessoaJuridica = possuiEspecializacao(dados, 'pessoa_juridica');

            if (!temPessoaFisica && !temPessoaJuridica) {
                const erro = new Error('ESPECIALIZACAO_OBRIGATORIA');
                erro.codigo = 'ESPECIALIZACAO_OBRIGATORIA';
                throw erro;
            }

            if (temPessoaFisica) {
                const pessoaFisica = await PessoaFisica.buscarPorPessoaId(
                    pessoa.id,
                    client
                );

                if (pessoaFisica) {
                    await PessoaFisica.atualizar({
                        id: pessoaFisica.id,
                        ...mapearDadosPessoaFisica(dados.pessoa_fisica),
                        client
                    });
                } else {
                    await PessoaFisica.criar({
                        pessoaId: pessoa.id,
                        ...mapearDadosPessoaFisica(dados.pessoa_fisica),
                        client
                    });
                }
            }

            if (temPessoaJuridica) {
                const pessoaJuridica = await PessoaJuridica.buscarPorPessoaId(
                    pessoa.id,
                    client
                );

                if (pessoaJuridica) {
                    await PessoaJuridica.atualizar({
                        id: pessoaJuridica.id,
                        ...mapearDadosPessoaJuridica(dados.pessoa_juridica),
                        client
                    });
                } else {
                    await PessoaJuridica.criar({
                        pessoaId: pessoa.id,
                        ...mapearDadosPessoaJuridica(dados.pessoa_juridica),
                        client
                    });
                }
            }

            const pessoaAtualizada = await Pessoa.buscarPorId(
                pessoa.id,
                client
            );
            const [pessoaFisicaAtualizada, pessoaJuridicaAtualizada] = await Promise.all([
                PessoaFisica.buscarPorPessoaId(pessoa.id, client),
                PessoaJuridica.buscarPorPessoaId(pessoa.id, client)
            ]);

            await client.query('COMMIT');

            return {
                ...pessoaAtualizada,
                pessoa_fisica: pessoaFisicaAtualizada,
                pessoa_juridica: pessoaJuridicaAtualizada
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;

        } finally {
            client.release();
        }
    }
}

module.exports = PessoaService;
