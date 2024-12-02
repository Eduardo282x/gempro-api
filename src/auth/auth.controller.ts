import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DtoLogin } from 'src/dtos/auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post()
    async login(@Body() bodyLogin: DtoLogin){
        return await this.authService.authenticateUser(bodyLogin.username, bodyLogin.password);
    }
}
