import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() createUser: CreateUserDto) {
    return this.usersService.create(createUser);
  }

  @Get('all')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':login')
  findOne(@Param('login') login: keyof UserEntity) {
    return this.usersService.findOne({ login });
  }
}
