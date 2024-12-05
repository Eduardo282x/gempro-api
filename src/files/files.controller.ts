import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
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
    async getActivities(@Param('idFile') idFile: string, @Res() res){
        try {
            const fileData: File = await this.filesServices.findFile(idFile) as File;
            if (!fileData) {
                throw new Error('Archivo no encontrado');
            }
            
            const filePath = join(process.cwd(), 'files_system/' + fileData.url);
            console.log('Ruta del archivo:', filePath); // Verifica la ruta del archivo
            res.sendFile(filePath, {
                headers: {
                    'Content-Type': 'application/pdf', // Asegúrate de que el tipo de contenido sea correcto
                }
            });
        } catch (err) {
            console.error('Error al buscar el archivo:', err);
            res.status(500).json({ message: 'Error al buscar el archivo' });
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
        @Body() body: { nameReport: string; email: string; senderId: string }
    ) {
        if (!file) {
            throw new BadRequestException('Archivo no encontrado');
        }

        const { nameReport, email, senderId } = body;

        // Lógica adicional
        return await this.filesServices.uploadFiles(
            file,
            nameReport,
            email,
            senderId,
        );
    }

}
