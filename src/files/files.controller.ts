import { Controller, Get } from '@nestjs/common';
import { FilesService } from './files.service';
import { File } from '@prisma/client';

@Controller('files')
export class FilesController {

    constructor(private filesServices: FilesService){}

    @Get()
    async getFiles(): Promise<File[]>  {
        return await this.filesServices.getFiles();
    }
}
