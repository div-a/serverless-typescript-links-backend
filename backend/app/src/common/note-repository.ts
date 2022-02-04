import { NoteItem } from "./note-item";

export interface NoteRepository {
  putNote(noteItem: NoteItem, table: string): Promise<void>;
  getNoteById(id: string, table: string): Promise<NoteItem>;
  getNotes(table: string): Promise<NoteItem[]>;
}
