import { IsString } from "class-validator";
import { DtoBaseResponse } from "./base.dto";

export class DtoLogin {
    @IsString()
    username: string;
    @IsString()
    password: string;
}

export class ResponseLogin extends DtoBaseResponse {
    token: string;
}