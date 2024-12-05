import { baseResponse, DtoBaseResponse } from 'src/dtos/base.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MainLoadService {

    constructor(private prismaService: PrismaService) { }

    async load(): Promise<DtoBaseResponse> {
        await this.prismaService.company.createMany({
            data: [
                {
                    name: 'Gempro',
                },
                {
                    name: 'PDVSA'
                }
            ]
        })

        await this.prismaService.user.createMany({
            data: [
                {
                    firstName: 'admin',
                    lastName: 'admin',
                    email: 'admin',
                    password: 'admin',
                    role: 'ADMIN',
                    status: true,
                    identify: '12345678',
                    specialty: 'admin',
                    companyId: 1,
                },
                {
                    firstName: 'Elio',
                    lastName: 'Rojas',
                    email: 'elio@gmail.com',
                    password: '1234',
                    role: 'WORKER',
                    status: true,
                    identify: '12345678',
                    specialty: 'Técnico',
                    companyId: 1,
                },
                {
                    firstName: 'Jose',
                    lastName: 'Perez',
                    email: 'jose@gmail.com',
                    password: '1234',
                    role: 'WORKER',
                    status: false,
                    identify: '12345678',
                    specialty: 'Ingeniero',
                    companyId: 1,
                },
                {
                    firstName: 'PDVSA',
                    lastName: 'PDVSA',
                    email: 'pdvsa',
                    password: '1234',
                    role: 'COMPANY',
                    status: true,
                    identify: '12345678',
                    specialty: 'company',
                    companyId: 2,
                }
            ]
        })

        baseResponse.message = 'Data cargada exitosamente.'
        return baseResponse;
    }
}
