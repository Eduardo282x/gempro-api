import { badResponse, baseResponse, DtoBaseResponse } from 'src/dtos/base.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DtoFilterReports } from 'src/dtos/files.dto';
import { Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {

    constructor(
        private prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) { }

    async getFiles(idUser: string): Promise<File[]> {
        const findUser = await this.prismaService.user.findFirst({
            where: {
                id: Number(idUser)
            }
        });

        if (findUser.role === 'WORKER') {
            const filesWorker = await this.prismaService.file.findMany({
                where: {
                    uploadedById: findUser.id
                },
                include: {
                    uploadedBy: true,
                    directedTo: {
                        include: {
                            company: true
                        }
                    },
                },
                orderBy: {
                    uploadedAt: 'desc'
                },
            });

            return filesWorker;
        } else if (findUser.role === 'COMPANY') {
            const filesCompany = await this.prismaService.file.findMany({
                where: {
                    directedToId: findUser.id
                },
                include: {
                    uploadedBy: true,
                    directedTo: {
                        include: {
                            company: true
                        }
                    },
                },
                orderBy: {
                    uploadedAt: 'desc'
                },
            });

            return filesCompany;
        }
        else {
            const files = await this.prismaService.file.findMany({
                include: {
                    uploadedBy: true,
                    directedTo: {
                        include: {
                            company: true
                        }
                    },
                },
                orderBy: {
                    uploadedAt: 'desc'
                },
            });

            return files;
        }
    }

    async getFilesFiltered(bodyFiltered: DtoFilterReports): Promise<File[]> {
        const { company, worker, userCompanies } = bodyFiltered;

        const whereClause: any = {};

        // Validar cada campo y agregarlo a la cláusula `where` si tiene valor
        if (worker) {
            whereClause.uploadedById = Number(worker);
        }

        if (userCompanies) {
            whereClause.directedToId = Number(userCompanies);
        }

        if (company) {
            whereClause.directedTo = {
                company: {
                    id: Number(company),
                },
            };
        }

        // Realizar la consulta con el filtro dinámico
        const files = await this.prismaService.file.findMany({
            where: whereClause,
            include: {
                uploadedBy: true,
                directedTo: {
                    include: {
                        company: true,
                    },
                },
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        return files;
    }

    async findFile(idFile: string): Promise<File | DtoBaseResponse> {
        const findFileName = await this.prismaService.file.findFirst({
            where: {
                id: Number(idFile)
            }
        });

        return findFileName;
    }

    async uploadFiles(file: Express.Multer.File, nameReport: string, email: string, senderId: string): Promise<DtoBaseResponse> {
        const findUserCompanies = await this.prismaService.user.findFirst({
            where: {
                email
            }
        })
        await this.prismaService.file.create({
            data: {
                name: nameReport,
                url: file.filename,
                uploadedById: Number(senderId),
                directedToId: findUserCompanies.id
            }
        });

        // Enviar correo con el archivo adjunto
        try {
            const filePath = path.join(process.cwd(), 'files_system/' + file.filename);

            const text = `
                            <p><strong>Informe técnico - GEMPRO</strong></p>
                            <p>Saludos cordiales,</p>
                            <p>Su informe técnico ya está disponible.</p>
                            <p><a href="https://nbw1f8c7-5173.use2.devtunnels.ms/">Visita nuestra pagina</a></p>
                            <p>En GEMPRO somos calidad y servicio.</p>
                            <p>¡Muchas gracias por preferirnos!</p>
                            <p>Venezuela, Edo Zulia - Maracaibo, Sabaneta, Ubr. Urdaneta, Av Principal, Calle 9, edificio Gempro 105A</p>
                            <p>Contacto +58 414-6355951</p>
                            <p><img src="cid:gemproLogo3" alt="GEMPRO Logo" style="width:200px;"/></p>
                        `;

            await this.emailService.sendEmailWithAttachment(
                email,
                'Gempro: Grupo Empresarial de Mantenimiento Proactivo - Informe Técnico.',
                text,
                filePath
            );

            if (findUserCompanies.secondEmail) {
                await this.emailService.sendEmailWithAttachment(
                    findUserCompanies.secondEmail,
                    'Gempro: Grupo Empresarial de Mantenimiento Proactivo - Informe Técnico.',
                    text,
                    filePath
                );
            }

            baseResponse.message = 'Archivo subido y enviado exitosamente.';
            return baseResponse;
        } catch (error) {
            console.error('Error enviando el correo:', error);
            badResponse.message = 'El archivo se guardó, pero no se pudo enviar el correo.';
            return badResponse;
        }

    }
}
