export interface NoteItem {
  id: string;
  userId: number;
  text: string;
  url: string;
  group: string;
  numTimesConfirmed: number;
  numTimesDenied: number;
}
