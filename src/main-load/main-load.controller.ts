import { Controller, Get } from '@nestjs/common';
import { MainLoadService } from './main-load.service';
import { DtoBaseResponse } from 'src/dtos/base.dto';

@Controller('main-load')
export class MainLoadController {

    constructor(private mainLoadService: MainLoadService){}

    @Get()
    async mainLoad(): Promise<DtoBaseResponse> {
        return await this.mainLoadService.load();
    }
}
