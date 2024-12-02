import { Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
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
}
