import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteController } from './note.controller';
import { Note } from './note.entity';
import { NoteService } from './note.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_PATH } from 'src/constants';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Note]),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_PATH,
    }),
  ],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
