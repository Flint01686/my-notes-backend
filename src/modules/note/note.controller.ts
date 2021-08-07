import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileUploadConfig } from '../../shared/FileUploaderConfig';

import { UserDto } from '../user/dto/user.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './note.entity';
import { NoteService } from './note.service';

const convertDtoToPostgre = (
  user: UserDto,
  noteDto: CreateNoteDto,
  attachments: Array<Express.Multer.File>,
) => {
  const newNote = new Note();
  newNote.text = noteDto.text ?? '';

  newNote.attachments = attachments.map((item) => item.filename);

  newNote.tags = noteDto.tags ? JSON.parse(noteDto.tags) : [];

  newNote.owner = user.id;
  return newNote;
};

function convertDtoPatchToPostgre(
  noteDto: CreateNoteDto,
  attachments: Array<Express.Multer.File>,
): Note {
  const newNote = new Note();
  newNote.text = noteDto.text ?? '';

  newNote.attachments = attachments.map((item) => item.filename);

  newNote.tags = noteDto.tags ? JSON.parse(noteDto.tags) : [];

  return newNote;
}

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  @UseGuards(AuthGuard())
  findAll(@Req() req: any) {
    return this.noteService.findAllById(<UserDto>req.user);
  }

  @Get('all')
  getAllNotes(): Promise<Note[]> {
    return this.noteService.findAll();
  }

  @Get(':id')
  getOneNote(@Param('id') id: string): Promise<Note> {
    return this.noteService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FilesInterceptor('attachments', FileUploadConfig.MaxFilesCount, {
      storage: diskStorage({
        destination: FileUploadConfig.destinationPath,
        filename: FileUploadConfig.customFileName,
      }),
    }),
  )
  addNote(
    @Body() createNoteDto: CreateNoteDto,
    @Req() req: any,
    @UploadedFiles() attachments: Array<Express.Multer.File>,
  ) {
    this.noteService.add(
      convertDtoToPostgre(<UserDto>req.user, createNoteDto, attachments),
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  deleteNote(@Param('id') id: string) {
    this.noteService.remove(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FilesInterceptor('attachments', FileUploadConfig.MaxFilesCount, {
      storage: diskStorage({
        destination: FileUploadConfig.destinationPath,
        filename: FileUploadConfig.customFileName,
      }),
    }),
  )
  updateNote(
    @Param('id') id: string,
    @Body() createNoteDto: CreateNoteDto,
    @UploadedFiles() attachments: Array<Express.Multer.File>,
  ) {
    this.noteService.update(
      id,
      convertDtoPatchToPostgre(createNoteDto, attachments),
    );
  }
}
