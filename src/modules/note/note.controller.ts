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

const basicDtoConverter = (
  noteDto: CreateNoteDto,
  attachments: Array<Express.Multer.File>,
) => {
  const newNote = new Note();
  newNote.text = noteDto.text ?? '';

  newNote.attachments = attachments.map((item) => item.filename);

  if (noteDto.localAttachments)
    newNote.attachments = newNote.attachments.concat(
      JSON.parse(noteDto.localAttachments),
    );

  newNote.tags = noteDto.tags ? JSON.parse(noteDto.tags) : [];

  newNote.isPinned = noteDto.isPinned === 'true';

  return newNote;
};

const convertDtoToPostgre = (
  user: UserDto,
  noteDto: CreateNoteDto,
  attachments: Array<Express.Multer.File>,
) => {
  const newNote = basicDtoConverter(noteDto, attachments);
  newNote.owner = user.id;

  return newNote;
};

function convertDtoPatchToPostgre(
  noteDto: CreateNoteDto,
  attachments: Array<Express.Multer.File>,
): Note {
  return basicDtoConverter(noteDto, attachments);
}

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  @UseGuards(AuthGuard())
  findAll(@Req() req: any) {
    return this.noteService.findAllByOwner(<UserDto>req.user);
  }

  @Get('/page/:page')
  @UseGuards(AuthGuard())
  findPage(@Req() req: any, @Param('page') page: number) {
    return this.noteService.findAllInPage(<UserDto>req.user, page);
  }

  @Get('/pagef/:page/:filter')
  @UseGuards(AuthGuard())
  findPageWithFilter(
    @Req() req: any,
    @Param('page') page: number,
    @Param('filter') filter: string,
  ) {
    return this.noteService.findAllInPageByFilter(
      <UserDto>req.user,
      page,
      filter,
    );
  }

  @Get('/pagec/:filter')
  @UseGuards(AuthGuard())
  findPagesCountByFilter(@Req() req: any, @Param('filter') filter: string) {
    return this.noteService.findPagesCount(<UserDto>req.user, filter);
  }

  @Get('/pagecnt')
  @UseGuards(AuthGuard())
  findPagesCount(@Req() req: any) {
    return this.noteService.pagesCount(<UserDto>req.user);
  }

  @Get('/pinned')
  @UseGuards(AuthGuard())
  findPinned(@Req() req: any) {
    return this.noteService.findPinnedByOwner(<UserDto>req.user);
  }

  @Get('all')
  getAllNotes(): Promise<Note[]> {
    return this.noteService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  getOneNote(@Req() req: any, @Param('id') id: number) {
    return this.noteService.findOne(<UserDto>req.user, id);
  }

  @Post(':id')
  @UseGuards(AuthGuard())
  cloneNote(@Req() req: any, @Param('id') id: number) {
    return this.noteService.cloneOne(<UserDto>req.user, id);
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
    this.noteService
      .add(convertDtoToPostgre(<UserDto>req.user, createNoteDto, attachments))
      .catch((e) => console.log(e));
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  deleteNote(@Param('id') id: string, @Req() req: any) {
    return this.noteService.remove(<UserDto>req.user, id);
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
    @Req() req: any,
    @Param('id') id: string,
    @Body() createNoteDto: CreateNoteDto,
    @UploadedFiles() attachments: Array<Express.Multer.File>,
  ) {
    return this.noteService.update(
      <UserDto>req.user,
      id,
      convertDtoPatchToPostgre(createNoteDto, attachments),
      JSON.parse(createNoteDto.localAttachments),
    );
  }
}
