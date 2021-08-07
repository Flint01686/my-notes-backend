import { UserEntity } from '../modules/user/user.entity';
import { UserDto } from '../modules/user/dto/user.dto';

export const toUserDto = (data: UserEntity): UserDto => {
  const { id, login, email } = data;
  const userDto: UserDto = { id, login, email };
  return userDto;
};
