import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DtoFilterReports } from 'src/dtos/files.dto';
import { FilesService } from './files.service';
import { File } from '@prisma/client';
import { diskStorage } from 'multer';
import { join } from 'path';

@Controller('files')
export class FilesController {

    constructor(private filesServices: FilesService) { }

    @Get('/:idUser')
    async getFiles(@Param('idUser') idUser: string): Promise<File[]> {
        return await this.filesServices.getFiles(idUser);
    }
    
    @Post('/filters')
    async getFilesFiltered(@Body() bodyFiltered: DtoFilterReports) {
        return await this.filesServices.getFilesFiltered(bodyFiltered);
    }

    @Get('/download/:idFile')
    async getActivities(@Param('idFile') idFile: string, @Res() res) {
        try {
            const fileData: File = await this.filesServices.findFile(idFile) as File;
            if (!fileData) {
                throw new Error('Archivo no encontrado');
            }
            const filePath = join(process.cwd(), 'files_system/' + fileData.url);
            res.sendFile(filePath);
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
