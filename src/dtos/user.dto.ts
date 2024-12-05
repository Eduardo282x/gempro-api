import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class DtoCreateUser {
    @IsString()
    firstName: string;
    @IsString()
    lastName: string;
    @IsEmail()
    email: string;
    @IsEmail()
    @IsOptional()
    secondEmail?: string;
    @IsString()
    identify: string;
    @IsString()
    specialty: string;
    @IsString()
    @IsOptional()
    company?: string;
}

export class DtoUpdateUser extends DtoCreateUser {
    @IsBoolean()
    status: boolean;
    @IsNumber()
    idUser: number;
}

export class DtoCompany {
    @IsString()
    name: string;
}