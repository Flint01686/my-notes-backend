import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDto } from '../user/dto/user.dto';
import { Note } from './note.entity';
import * as fs from 'fs';
import { join } from 'path';
import { PUBLIC_PATH } from 'src/constants';

const NOTE_ON_PAGE_COUNT = 9;

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async findAllByOwner({ id }: UserDto): Promise<Note[]> {
    return await this.noteRepository.find({
      where: {
        owner: id,
      },
    });
  }

  async findPinnedByOwner({ id }: UserDto): Promise<Note[]> {
    return await this.noteRepository.find({
      where: {
        owner: id,
        isPinned: true,
      },
    });
  }

  async findePagesCount({ id }: UserDto, filter: string): Promise<number> {
    return (
      (await this.noteRepository
        .createQueryBuilder('note')
        .select('SUM(note.id)', 'sum')
        .where('note.owner= :id', { id: id })
        .andWhere(
          new Brackets((qb) => {
            qb.where('note.text like :filter', {
              filter: `%${filter}%`,
            }).orWhere(':filter LIKE ANY (note.tags)', {
              filter: filter,
            });
          }),
        )
        .orderBy({
          'note.isPinned': 'DESC',
          'note.id': 'DESC',
        })
        .getRawOne()) / NOTE_ON_PAGE_COUNT
    );
    // .then((ans) => ans);
  }

  async findAllInPageByFilter(
    { id }: UserDto,
    page: number,
    filter: string,
  ): Promise<Note[]> {
    if (filter === '') filter = '*';
    console.log(filter);
    return await this.noteRepository
      .createQueryBuilder('note')
      .where('note.owner= :id', { id: id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('note.text like :filter', {
            filter: `%${filter}%`,
          }).orWhere(':filter LIKE ANY (note.tags)', {
            filter: filter,
          });
        }),
      )
      .orderBy({
        'note.isPinned': 'DESC',
        'note.id': 'DESC',
      })
      .skip(page * NOTE_ON_PAGE_COUNT)
      .take(NOTE_ON_PAGE_COUNT)
      .getMany();
  }

  async findAllInPage({ id }: UserDto, page: number): Promise<Note[]> {
    return await this.noteRepository
      .createQueryBuilder('note')
      .where('note.owner= :id', { id: id })
      .orderBy({
        'note.isPinned': 'DESC',
        'note.id': 'DESC',
      })
      .skip(page * NOTE_ON_PAGE_COUNT)
      .take(NOTE_ON_PAGE_COUNT)
      .getMany();
  }
  // async findAllInPage(
  //   { id }: UserDto,
  //   page: number,
  // ): Promise<{
  //   allNotes: Note[];
  //   pinnedNotes: Note[];
  // }> {
  //   return {
  //     allNotes: await this.noteRepository
  //       .createQueryBuilder('note')
  //       .where('note.owner= :id', { id: id })
  //       .orderBy({
  //         'note.isPinned': 'DESC',
  //         'note.id': 'DESC',
  //       })
  //       .skip(page * NOTE_ON_PAGE_COUNT)
  //       .take(NOTE_ON_PAGE_COUNT)
  //       .getMany(),
  //     pinnedNotes: await this.noteRepository.find({
  //       where: {
  //         owner: id,
  //         isPinned: true,
  //       },
  //     }),
  //   };
  // }

  findAll(): Promise<Note[]> {
    return this.noteRepository.find();
  }

  findOne({ id }: UserDto, noteId: number): Promise<Note> {
    return this.noteRepository.findOne({
      where: {
        owner: id,
        id: noteId,
      },
    });
  }

  async cloneOne(user: UserDto, id: number): Promise<Note> {
    return await this.findOne(user, id).then((note) => {
      return this.noteRepository.save({
        isPinned: note.isPinned,
        id: undefined,
        attachments: note.attachments,
        tags: note.tags,
        owner: note.owner,
        text: note.text,
      });
    });
  }

  async remove(user: UserDto, noteId: string): Promise<DeleteResult> {
    return await this.findAllByOwner(user).then((res) => {
      let allAttacnments = [];
      res.forEach((note) => {
        if (note.id.toString() !== noteId)
          allAttacnments = allAttacnments.concat(note.attachments);
      });
      return this.noteRepository.findOne(noteId).then((res) => {
        res.attachments.forEach((attach) => {
          if (!allAttacnments.includes(attach))
            fs.unlinkSync(join(PUBLIC_PATH, attach));
        });
        return this.noteRepository.delete(noteId);
      });
    });
  }

  async add(note: Note): Promise<Note> {
    return await this.noteRepository.save(note);
  }

  async update(
    user: UserDto,
    id: string,
    note: Note,
    filesForSave: string[],
  ): Promise<UpdateResult> {
    return await this.findAllByOwner(user).then((res) => {
      let allAttacnments = filesForSave;
      res.forEach((note) => {
        if (note.id.toString() !== id)
          allAttacnments = allAttacnments.concat(note.attachments);
      });
      return this.noteRepository.findOne(id).then((res) => {
        res.attachments.forEach((attach) => {
          if (!allAttacnments.includes(attach))
            fs.unlinkSync(join(PUBLIC_PATH, attach));
        });
        return this.noteRepository.update(id, note);
      });
    });
    // const prevNoteState = this.noteRepository.findOne(id);
    // prevNoteState.then((res) => {
    //   res.attachments.forEach((item) => {
    //     if (!filesForSave.includes(item))
    //       fs.unlinkSync(join(PUBLIC_PATH, item));
    //   });
    // });
    // return await this.noteRepository.update(id, note);
  }
}
