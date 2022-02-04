import { DynamoDB } from "aws-sdk";

import { NoteItem } from "./note-item";
import { NoteRepository } from "./note-repository";

export class NoteDynamoClientRepository implements NoteRepository {
  docClient: DynamoDB.DocumentClient;

  constructor() {
    this.docClient = new DynamoDB.DocumentClient();
  }

  // Stores the given NoteItem in the DynamoDB Table specified.
  async putNote(noteItem: NoteItem, table: string): Promise<void> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: table,
      Item: noteItem,
    };

    console.log(`Storing record ${noteItem.id} in the ${table} Table.`);
    await this.docClient.put(params).promise();
    return;
  }

  // Fetches a NoteItem with an Id matching the requested id from DynamoDB.
  async getNoteById(id: string, table: string): Promise<NoteItem> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: table,
      Key: {
        id: id,
      },
    };

    console.log(`Fetching record ${id} from the ${table} Table.`);
    const result: DynamoDB.DocumentClient.GetItemOutput = await this.docClient
      .get(params)
      .promise();
    return result.Item as NoteItem;
  }

  //get Notes from DynamoDB
  async getNotes(table: string): Promise<NoteItem[]> {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: table,
    };

    console.log(`Fetching all records from the ${table} Table.`);
    const result: DynamoDB.DocumentClient.ScanOutput = await this.docClient
      .scan(params)
      .promise();
    return result.Items as NoteItem[];
  }
}
