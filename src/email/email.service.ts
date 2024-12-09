import nodemailer from 'nodemailer';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export class EmailService {
    private transporter;

    constructor(private readonly configService: ConfigService) {

        this.transporter = nodemailer.createTransport({
            service: 'gmail', // O utiliza otro servicio como SendGrid, SES, etc.
            auth: {
                user: this.configService.get<string>('EMAIL'), // Tu dirección de correo
                pass: this.configService.get<string>('PASSWORD_EMAIL'), // Contraseña o token de aplicación
            },
        });
    }

    async sendEmailWithAttachment(to: string, subject: string, text: string, filePath: string) {
        const fileName = path.basename(filePath);

        const mailOptions = {
            from: this.configService.get<string>('EMAIL'),
            to,
            subject,
            text,
            attachments: [
                {
                    filename: fileName,
                    path: filePath, // Ruta completa al archivo
                },
            ],
        };

        return this.transporter.sendMail(mailOptions);
    }
}
