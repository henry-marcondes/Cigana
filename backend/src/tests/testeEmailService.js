require('dotenv').config();

const EmailService = require('../services/EmailService');

async function testar() {
    try {
        const resultado = await EmailService.enviar({
            para: 'henryartesrobotica@gmail.com',
            assunto: 'Teste de e-mail — Ciganas',
            texto: 'Este é um teste do EmailService da plataforma Ciganas.',
            html: `
                <h2>Ciganas</h2>
                <p>Este é um teste do <strong>EmailService</strong>.</p>
                <p>Envio realizado através do Brevo SMTP.</p>
            `
        });

        console.log('E-mail enviado com sucesso.');
        console.log({
            messageId: resultado.messageId,
            response: resultado.response
        });

    } catch (error) {
        console.error('Erro ao enviar e-mail:');
        console.error(error);
    }
}

testar();
