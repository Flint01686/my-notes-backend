import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassRestore } from './passwordRestore.entity';

@Module({
  providers: [AuthService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([PassRestore]),
    UsersModule,
    PassportModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY ?? 'd9cff2b5e2ba43babf7f10980a4f7e42',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES ?? '24h',
      },
    }),
  ],
  exports: [AuthService, PassportModule, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
