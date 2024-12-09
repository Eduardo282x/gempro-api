import { badResponse, baseResponse, DtoBaseResponse } from 'src/dtos/base.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DtoFilterReports } from 'src/dtos/files.dto';
import { Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {

    constructor(private prismaService: PrismaService,private readonly configService: ConfigService) { }

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
        const saveFile = await this.prismaService.file.create({
            data: {
                name: nameReport,
                url: file.filename,
                uploadedById: Number(senderId),
                directedToId: findUserCompanies.id
            }
        });

        // Enviar correo con el archivo adjunto
        try {
            const emailService = new EmailService(this.configService);
            const filePath = path.resolve(__dirname, '../../files_system', file.filename); // Ruta completa al archivo en la carpeta `files_system`

            await emailService.sendEmailWithAttachment(
                email,
                `Nuevo archivo: ${nameReport}`,
                `Hola, se ha subido un nuevo archivo: ${nameReport}.`,
                filePath
            );

            baseResponse.message = 'Archivo subido y enviado exitosamente.';
            return baseResponse;
        } catch (error) {
            console.error('Error enviando el correo:', error);
            badResponse.message = 'El archivo se guardó, pero no se pudo enviar el correo.';
            return badResponse;
        }

    }
}
