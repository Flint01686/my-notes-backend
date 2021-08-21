export class CreateNoteDto {
  readonly text: string;
  readonly tags: string;
  readonly isPinned: string;
  readonly localAttachments?: string;
}
