import { Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
import { badResponse, baseResponse, DtoBaseResponse } from 'src/dtos/base.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilesService {

    constructor(private prismaService: PrismaService) { }

    async getFiles(): Promise<File[]> {
        const files = await this.prismaService.file.findMany({
            include: {
                uploadedBy: true,
                directedTo: {
                    include: {
                        company: true
                    }
                },
            },
        })

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
            where:{
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

        if (!saveFile) {
            badResponse.message = 'No se pudo guardar el archivo';
            return badResponse;
        }

        baseResponse.message = 'Archivo subido exitosamente.';
        return baseResponse;
    }
}
