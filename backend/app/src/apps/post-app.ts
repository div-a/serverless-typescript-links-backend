import { ApiGatewayEvent } from "../common/apigateway/apigateway-event";
import { ApiGatewayResponse } from "../common/apigateway/apigateway-response";
import { NoteRepository } from "../common/note-repository";
import { NoteItem } from "../common/note-item";

import { LambdaApp } from "./lambda-app";

/**
 * PostApp is a LambdaApp that puts a new record into DynamoDB using the API Gateway event body as the record content.
 *
 */
export class PostApp implements LambdaApp {
  table: string;
  repository: NoteRepository;

  constructor(table: string, repository: NoteRepository) {
    this.table = table;
    this.repository = repository;
  }

  async run(event: ApiGatewayEvent): Promise<ApiGatewayResponse> {
    let note: NoteItem;
    try {
      note = JSON.parse(event.body);
      const {
        userId,
        text: text,
        url,
        group,
        numTimesConfirmed,
        numTimesDenied,
      } = note;
      if (!userId || !text || !url || !group) {
        console.log("Missing field");
        return { statusCode: 422 };
      }

      if (!numTimesConfirmed) {
        note.numTimesConfirmed = 0;
      }

      if (!numTimesDenied) {
        note.numTimesDenied = 0;
      }

      note.id = new Date().getTime().toString();
    } catch (err) {
      console.log("Event body could not be parsed as JSON");
      return { statusCode: 400 };
    }

    try {
      await this.repository.putNote(note, this.table);
      return { statusCode: 201, body: JSON.stringify(note) };
    } catch (err) {
      console.log(err.message);
      return { statusCode: 500 };
    }
  }
}
