import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, LoginStatus, RegistrationStatus } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ResetPasswordDto } from '../user/dto/reset-password.dto';
import { SendEmailDto } from '../user/dto/send-email.dto';
import * as sgMail from '@sendgrid/mail';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto): Promise<LoginStatus> {
    return await this.authService.login(loginUserDto);
  }

  @Post('register')
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto,
    );
    return result;
  }

  @Post('resetpassword')
  public async resetPass(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.resetPassword(
      resetPasswordDto,
    );
    return result;
  }

  @Post('giveaccesstoreset')
  public async giveAccess(
    @Body() tokenData: { token: string },
  ): Promise<boolean> {
    const result = await this.authService.giveAccessByToken(tokenData.token);
    return result.access;
  }

  @Post('sendmail')
  public async sendMail(@Body() SendEmail: SendEmailDto): Promise<any> {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const tokenData = await this.authService.createToken(SendEmail.email);
    if (!tokenData) return null;
    console.log('td', tokenData, '/td');

    const msg = {
      to: SendEmail.email,
      from: 'kirill01686@gmail.com',
      subject:
        'This message just for u baby. U can restore password with link below',
      html: `Click here to <a href="${process.env.CLIENT_HOST}/resetpassword/${tokenData.token}">restore password</a>`,
    };

    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
      });
    return SendEmail;
  }
}
