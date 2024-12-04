import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { File } from '@prisma/client';
import { badResponse, DtoBaseResponse } from 'src/dtos/base.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Observable, of } from 'rxjs';
import { join } from 'path';

@Controller('files')
export class FilesController {

    constructor(private filesServices: FilesService) { }

    @Get()
    async getFiles(): Promise<File[]> {
        return await this.filesServices.getFiles();
    }

    @Get('/:idFile')
    async getActivities(@Param('idFile') idFile: string, @Res() res): Promise<Observable<Object> | DtoBaseResponse> {
        try {
            const fileName: File = await this.filesServices.findFile(idFile) as File;
            if (fileName) {
                return of(res.sendFile(join(process.cwd(), 'files_system/' + fileName.url)));
            }
        } catch(err) {
            badResponse.message = 'Error al buscar el archivo';
            return badResponse;
        }
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './files_system',
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            },
        }),
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
    ) {

        // Verifica si el archivo se ha cargado correctamente.
        if (!file) {
            throw new BadRequestException('Archivo no encontrado');
        }

        // Continúa con la lógica de negocio (por ejemplo, guardar en la base de datos).
        return await this.filesServices.uploadFiles(file);
    }
}
