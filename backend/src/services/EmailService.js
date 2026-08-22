const nodemailer = require('nodemailer');

class EmailService {

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
}

module.exports = EmailService;
