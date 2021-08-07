import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from '../user/dto/user.dto';
import { Note } from './note.entity';

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

  findAll(): Promise<Note[]> {
    return this.noteRepository.find();
  }

  findOne(id: string): Promise<Note> {
    return this.noteRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.noteRepository.delete(id);
  }

  async add(note: Note): Promise<void> {
    await this.noteRepository.save(note);
  }

  async update(id: string, note: Note): Promise<void> {
    await this.noteRepository.update(id, note);
  }
}
