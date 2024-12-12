import { Injectable } from '@nestjs/common';
import { ResponseLogin } from 'src/dtos/auth.dto';
import { badResponse, baseResponse, DtoBaseResponse } from 'src/dtos/base.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(private prismaService: PrismaService, private readonly configService: ConfigService){}

    async authenticateUser(email: string, password: string): Promise<ResponseLogin | DtoBaseResponse> {
        const findUser = await this.prismaService.user.findFirst({
            where: {
                email,
                password,
            },
            include: {
                company: true,
            }
        });

        if(!findUser){
            badResponse.message = 'El email o la contraseña son incorrectos';
            return badResponse;
        } 

        if(!findUser.status){
            badResponse.message = 'El usuario no se encuentra activo';
            return badResponse;
        } 

        baseResponse.message = `Bienvenido ${findUser.firstName} ${findUser.lastName}`;

        const payload = {
            id: findUser.id,
            firstName: findUser.id,
            lastName: findUser.lastName,
            email: findUser.email,
            role: findUser.role,
            specialty: findUser.specialty,
            company: findUser.company,
            createdAt: findUser.createdAt,
            updatedAt: findUser.updatedAt
        };
        
        // Generar el token con una clave secreta y un tiempo de expiración
        const secretKey = this.configService.get<string>('JWT_SECRET'); // Usa una clave secreta desde las variables de entorno
        const token = jwt.sign(payload, secretKey, { expiresIn: '8h' });

        const responseLogin: ResponseLogin = {
            ...baseResponse,
            token
        }

        return responseLogin;
    }
}
