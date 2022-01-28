export interface NoteItem {
  id: string;
  userId: string;
  noteText: string;
  url: string;
  group: string;
  numTimesConfirmed: number;
  numTimesDenied: number;
}
