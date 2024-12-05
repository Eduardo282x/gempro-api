import { IsString } from "class-validator";

export class DtoFilterReports {
    @IsString()
    company: string;
    @IsString()
    worker: string;
    @IsString()
    userCompanies: string;
}