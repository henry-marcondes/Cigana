const nodemailer = require('nodemailer');

class EmailService {

    static get destinatarioNotificacaoPlataforma() {
        return process.env.PLATFORM_NOTIFICATION_EMAIL;
    }

    static criarTransporter() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    static async enviar({
        para,
        assunto,
        texto,
        html
    }) {
        const transporter = this.criarTransporter();

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: para,
            subject: assunto,
            text: texto,
            html
        });

        return info;
    }

    static async notificarAceiteContrato(dados) {
        const para = this.destinatarioNotificacaoPlataforma;
        if (!para) {
            throw new Error(
                'PLATFORM_NOTIFICATION_EMAIL não está configurado.'
            );
        }

        const escaparHtml = (valor) => String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        const seguro = Object.fromEntries(
            Object.entries(dados).map(([chave, valor]) => [
                chave,
                escaparHtml(valor)
            ])
        );

        const texto = `Olá,\n\nUm novo aceite eletrônico foi confirmado na Plataforma Cigana.\n\nAutor: ${dados.nome_autor}\n\nE-mail: ${dados.email_autor}\n\nObra: ${dados.titulo_obra}\n\nContrato: ${dados.nome_contrato}\n\nVersão: ${dados.versao_contrato}\n\nData/hora: ${dados.data_hora}\n\nRegistro eletrônico: ${dados.registro_eletronico}\n\nO aceite foi confirmado mediante código enviado ao e-mail cadastrado do usuário autenticado.\n\nAtenciosamente,\n\nPlataforma Cigana`;
        const html = `<p>Olá,</p><p>Um novo aceite eletrônico foi confirmado na Plataforma Cigana.</p><p><strong>Autor:</strong> ${seguro.nome_autor}</p><p><strong>E-mail:</strong> ${seguro.email_autor}</p><p><strong>Obra:</strong> ${seguro.titulo_obra}</p><p><strong>Contrato:</strong> ${seguro.nome_contrato}</p><p><strong>Versão:</strong> ${seguro.versao_contrato}</p><p><strong>Data/hora:</strong> ${seguro.data_hora}</p><p><strong>Registro eletrônico:</strong> ${seguro.registro_eletronico}</p><p>O aceite foi confirmado mediante código enviado ao e-mail cadastrado do usuário autenticado.</p><p>Atenciosamente,<br>Plataforma Cigana</p>`;

        return this.enviar({
            para,
            assunto: 'Novo aceite de contrato — Plataforma Cigana',
            texto,
            html
        });
    }
}

module.exports = EmailService;
