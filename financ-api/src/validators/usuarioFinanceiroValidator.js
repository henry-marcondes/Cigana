const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validarUsuarioAutenticado(req, res, next) {
    const usuario = req.usuario;

    if (
        !usuario ||
        typeof usuario.id !== 'string' ||
        !UUID_REGEX.test(usuario.id) ||
        usuario.sub !== usuario.id
    ) {
        return res.status(401).json({
            success: false,
            message: 'Identidade do usuário autenticado inválida.'
        });
    }

    return next();
}

module.exports = { validarUsuarioAutenticado };
