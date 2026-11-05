function verificar(req, res) {
    return res.status(200).json({
        status: 'ok',
        service: 'financ-api'
    });
}

module.exports = { verificar };
