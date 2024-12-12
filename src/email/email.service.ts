import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        const email = this.configService.get<string>('EMAIL');
        const password = this.configService.get<string>('PASSWORD_EMAIL');

        if (!email || !password) {
            throw new Error('Las credenciales de correo no están configuradas correctamente.');
        }

        this.transporter = nodemailer.createTransport({
            host: 'mail.gempro.com.ve', // Asegúrate de que estás usando el servicio correcto
            port: 465,                    // Puerto estándar para conexiones seguras
            secure: true,   
            auth: {
                user: email,
                pass: password,
            }
        });
    }

    async sendEmailWithAttachment(to: string, subject: string, text: string, filePath: string) {
        const fileName = path.basename(filePath);

        const mailOptions = {
            from: this.configService.get<string>('EMAIL'),
            to,
            subject,
            
            html: text,
            attachments: [
                {
                    filename: 'gemproLogo3.jpg', // Archivo de la imagen
                    path: path.resolve(__dirname, '../assets/img/gemproLogo3.jpg'), // Ruta a la imagen
                    cid: 'gemproLogo3', // CID para embebido en el HTML
                },
                {
                    filename: fileName,
                    path: filePath, // Ruta completa al archivo
                },
            ],
        };

        return this.transporter.sendMail(mailOptions);
    }
}
