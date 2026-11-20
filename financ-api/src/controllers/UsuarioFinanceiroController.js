const UsuarioFinanceiroService = require('../services/UsuarioFinanceiroService');

async function consultarUsuarioAutenticado(req, res) {
    try {
        const resumo = await UsuarioFinanceiroService.buscarResumoUsuario(
            req.usuario.usuarioFinanceiroId
        );

        if (!resumo || !resumo.ativo) {
            return res.status(403).json({
                success: false,
                message: 'Usuário financeiro sem cadastro ativo.'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                usuario: {
                    id: req.usuario.id,
                    ativo: resumo.ativo
                },
                permissoes: resumo.permissoes
            }
        });
    } catch {
        return res.status(503).json({
            success: false,
            message: 'Não foi possível consultar os dados financeiros do usuário.'
        });
    }
}

module.exports = { consultarUsuarioAutenticado };
