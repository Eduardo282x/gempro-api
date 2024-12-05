import { badResponse, baseResponse, DtoBaseResponse } from 'src/dtos/base.dto';
import { DtoCompany, DtoCreateUser, DtoUpdateUser } from 'src/dtos/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {

    constructor(private prismaService: PrismaService) { }

    async workers() {
        return await this.prismaService.user.findMany(
            {
                where: {
                    role: 'WORKER'
                }
            });
    }
    async usersCompanies() {
        return await this.prismaService.user.findMany(
            {
                where: {
                    role: 'COMPANY'
                },
                include: {
                    company: true
                }
            });
    }

    async usersByCompanies(companyId) {
        return await this.prismaService.user.findMany(
            {
                where: {
                    role: 'COMPANY',
                    companyId
                },
            });
    }

    async companies() {
        return await this.prismaService.company.findMany({
            where: {
                name: {
                    not: {
                        contains: 'Gempro'
                    }
                }
            }
        });
    }

    async createCompany(company: DtoCompany): Promise<DtoBaseResponse> {
        try {
            await this.prismaService.company.create({
                data: {
                    name: company.name,
                }
            });

            baseResponse.message = 'Compañía creada exitosamente.'
            return baseResponse;
        } catch (err) {
            badResponse.message = 'Error al crear la compañía.'
            return badResponse;
        }
    }

    async createUser(anyUser: DtoCreateUser, role: Role): Promise<DtoBaseResponse> {
        let newCompany = 1

        if (role === 'COMPANY') {
            const findCompany = await this.prismaService.company.findFirst({
                where: {
                    name: {
                        equals: anyUser.company,
                        mode: 'insensitive',
                    }
                }
            })
            if (findCompany) newCompany = findCompany.id

            if (!findCompany) {
                const company = await this.prismaService.company.create({
                    data: {
                        name: anyUser.company
                    }
                });

                newCompany = company.id;
            }
        }

        try {
            await this.prismaService.user.create({
                data: {
                    firstName: anyUser.firstName,
                    lastName: anyUser.lastName,
                    email: anyUser.email,
                    secondEmail: anyUser.secondEmail !== '' ? anyUser.secondEmail : null,
                    password: anyUser.identify,
                    role: role,
                    status: true,
                    identify: anyUser.identify,
                    companyId: newCompany,
                    specialty: anyUser.specialty,
                }
            });

            baseResponse.message = 'Trabajador creado exitosamente';
            return baseResponse;
        } catch (err) {
            badResponse.message = 'Error al crear el trabajador ' + err.message;
            return badResponse;
        }
    }

    async updateWorker(anyUser: DtoUpdateUser, role: Role): Promise<DtoBaseResponse> {
        let newCompany = 1

        if (role === 'COMPANY') {
            const findCompany = await this.prismaService.company.findFirst({
                where: {
                    name: {
                        equals: anyUser.company,
                        mode: 'insensitive',
                    }
                }
            })
            if (findCompany) newCompany = findCompany.id;

            if (!findCompany) {
                const company = await this.prismaService.company.create({
                    data: {
                        name: anyUser.company
                    }
                });

                newCompany = company.id;
            }
        }

        const updWorker = await this.prismaService.user.update({
            data: {
                firstName: anyUser.firstName,
                lastName: anyUser.lastName,
                secondEmail: anyUser.secondEmail !== '' ? anyUser.secondEmail : null,
                password: anyUser.identify,
                role: role,
                status: anyUser.status,
                identify: anyUser.identify,
                companyId: newCompany,
                specialty: anyUser.specialty,
            },
            where: {
                id: anyUser.idUser
            }
        });


        if (anyUser.email) {
            updWorker.email = anyUser.email;
        }


        if (!updWorker) {
            badResponse.message = 'Error al actualizar el trabajador';
            return badResponse;
        }

        baseResponse.message = 'Trabajador actualizado exitosamente';
        return baseResponse;
    }
}
