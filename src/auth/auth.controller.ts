import { Body, Controller, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DtoChangePassword, DtoLogin } from 'src/dtos/auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post()
    async login(@Body() bodyLogin: DtoLogin){
        return await this.authService.authenticateUser(bodyLogin.username, bodyLogin.password);
    }

    @Put('/password')
    async changePassword(@Body() bodyPassword: DtoChangePassword){
        return await this.authService.changePassword(bodyPassword.userId, bodyPassword.password);
    }
}
