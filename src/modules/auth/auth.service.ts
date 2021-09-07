import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { UserDto } from '../user/dto/user.dto';
import { JwtPayload } from './jwt.strategy';
import { jwtConfig } from './constants';
import { ResetPasswordDto } from '../user/dto/reset-password.dto';
import { PassRestore } from './passwordRestore.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export interface RegistrationStatus {
  success: boolean;
  message: string;
}

export interface ResetStatus {
  success: boolean;
  message: string;
}

export interface LoginStatus {
  // eslint-disable-next-line @typescript-eslint/ban-types
  login: object;
}

export interface AccessStatus {
  access: boolean;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PassRestore)
    private passRestoreRepo: Repository<PassRestore>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginStatus> {
    const user = await this.usersService.findByLogin(loginUserDto);
    const token = this._createToken(user);

    return {
      login: user.login,
      ...token,
    };
  }

  private _createToken({ login }: UserDto): any {
    const user: JwtPayload = { login };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn: jwtConfig.expiresIn,
      accessToken,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetStatus> {
    let status: ResetStatus = {
      success: true,
      message: 'password reset command succesfull',
    };
    try {
      await this.usersService.resetPassword(resetPasswordDto);
    } catch (err) {
      status = {
        success: false,
        message: err,
      };
    }
    return status;
  }

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    };
    try {
      await this.usersService.create(userDto);
    } catch (err) {
      status = {
        success: false,
        message: err,
      };
    }
    return status;
  }

  async giveAccessByToken(token: string) {
    let accessStatus: AccessStatus = {
      access: false,
      email: '',
    };
    try {
      const infoByToken = await this.passRestoreRepo.findOneOrFail({
        where: { token },
      });
      accessStatus = {
        access: true,
        email: infoByToken.email,
      };
      await this.passRestoreRepo.delete(infoByToken.email);
    } catch (e) {
      console.error(e);
    } finally {
      return accessStatus;
    }
  }

  async createToken(email: string) {
    try {
      return await this.passRestoreRepo.findOneOrFail(email);
    } catch (e) {
      return await this.passRestoreRepo.create({
        email: email,
        token: uuidv4(),
      });
    }
  }
}
