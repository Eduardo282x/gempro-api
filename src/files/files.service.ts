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

    async uploadFiles(file: Express.Multer.File,): Promise<DtoBaseResponse> {
        const saveFile = await this.prismaService.file.create({
            data: {
                name: file.filename,
                url: file.filename,
                uploadedById: 1,
                directedToId: 1
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
