import { DtoCompany, DtoCreateUser, DtoUpdateUser } from 'src/dtos/user.dto';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { DtoBaseResponse } from 'src/dtos/base.dto';
import { UsersService } from './users.service';
import { Company, User } from '@prisma/client';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Get('/company')
    async getCompanies(): Promise<Company[]> {
        return await this.userService.companies();
    }

    @Get('/userCompanies')
    async getUserCompanies(): Promise<User[]> {
        return await this.userService.usersCompanies();
    }

    @Get('/userByCompanies/:id')
    async getUserByCompanies(@Param('id') id: string): Promise<User[]> {
        return await this.userService.usersByCompanies(Number(id));
    }

    @Get('/workers')
    async getWorkers(): Promise<User[]> {
        return await this.userService.workers();
    }

    @Post('/workers')
    async createWorkers(@Body() user: DtoCreateUser): Promise<DtoBaseResponse> {
        return await this.userService.createUser(user, 'WORKER');
    }
    @Post('/userCompanies')
    async createUserCompany(@Body() user: DtoCreateUser): Promise<DtoBaseResponse> {
        return await this.userService.createUser(user, 'COMPANY');
    }

    @Post('/company')
    async createCompany(@Body() company: DtoCompany): Promise<DtoBaseResponse> {
        return await this.userService.createCompany(company);
    }

    @Put('/workers')
    async updateWorkers(@Body() user: DtoUpdateUser): Promise<DtoBaseResponse> {
        return await this.userService.updateWorker(user, 'WORKER');
    }
    @Put('/userCompanies')
    async updateUserCompany(@Body() user: DtoUpdateUser): Promise<DtoBaseResponse> {
        return await this.userService.updateWorker(user, 'COMPANY');
    }
}
