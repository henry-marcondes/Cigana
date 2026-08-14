
const pool = require('../db/connection');
const Cena = require('../models/Cena');

class CenaService {

static async listarPorCapitulo(capitulo_id) {
    return await Cena.listarPorCapitulo(capitulo_id);
}

static async buscarPorId(id) {
    const cena = await Cena.buscarPorId(id);

    if (!cena) {
        throw new Error('Cena não encontrada.');
    }

    return cena;
}

static async buscarPorSlug(capitulo_id, slug) {
    const cena = await Cena.buscarPorSlug(capitulo_id, slug);

    if (!cena) {
        throw new Error('Cena não encontrada.');
    }

    return cena;
}

static async buscarCenaInicial(capitulo_id) {
    const cena = await Cena.buscarCenaInicial(capitulo_id);

    if (!cena) {
        throw new Error('Cena inicial não encontrada.');
    }

    return cena;
}

static async criar(dados) {
    const {
        capitulo_id,
        slug
    } = dados;

    const cenaExistente = await Cena.buscarPorSlug(
        capitulo_id,
        slug
    );

    if (cenaExistente) {
        throw new Error('Já existe uma cena com este slug neste capítulo.');
    }

    return await Cena.criar(dados);
}

static async alterarInformacoes(id, dados) {
    const cena = await Cena.buscarPorId(id);

    if (!cena) {
        throw new Error('Cena não encontrada.');
    }

    const cenaComMesmoSlug = await Cena.buscarPorSlug(
        cena.capitulo_id,
        dados.slug
    );

    if (
        cenaComMesmoSlug &&
        cenaComMesmoSlug.id !== id
    ) {
        throw new Error('Já existe uma cena com este slug neste capítulo.');
    }

    const cenaAlterada = await Cena.alterarInformacoes(
        id,
        dados
    );

    if (!cenaAlterada) {
        throw new Error('Cena não encontrada.');
    }

    return cenaAlterada;
}

static async definirCenaInicial(id) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cena = await Cena.buscarPorId(id);

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const cenaInicial = await Cena.definirCenaInicial(
            id,
            client
        );

        if (!cenaInicial) {
            throw new Error('Não foi possível definir a cena inicial.');
        }

        await client.query('COMMIT');

        return cenaInicial;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;

    } finally {
        client.release();
    }
}

static async desativar(id) {
    const cena = await Cena.buscarPorId(id);

    if (!cena) {
        throw new Error('Cena não encontrada.');
    }

    return await Cena.desativar(id);
}

}

module.exports = CenaService;
