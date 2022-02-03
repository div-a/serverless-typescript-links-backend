import "mocha";
import { expect } from "chai";
import { Mock, It, Times } from "moq.ts";

import { GetByIdApp } from "../../src/apps/get-by-id-app";
import { NoteItem } from "../../src/common/note-item";
import { NoteRepository } from "../../src/common/note-repository";
import { ApiGatewayResponse } from "../../src/common/apigateway/apigateway-response";

import { ApiGatewayEventMock } from "../mocks/apigateway-event-mock";

describe("PostApp instance", () => {
  const tableName = "MY_TABLE";

  // Stubs out our NoteRepository interface so we can simulate the expected behavior
  // with a successful "put" to the underlying data store.
  const repoMock = new Mock<NoteRepository>()
    .setup((instance) => instance.putNote(It.IsAny(), tableName))
    .returns(
      new Promise<void>((resolve) => {
        resolve();
      })
    );

  describe("constructor", () => {
    it("table is assigned", () => {
      const app = new GetByIdApp(tableName, repoMock.object());

      expect(app.table).to.equal(tableName);
    });

    it("repository is assigned", () => {
      const app = new GetByIdApp(tableName, repoMock.object());

      expect(app.repository).to.equal(repoMock.object());
    });
  });

  describe("run", () => {
    it('path parameter missing "id" returns 404 status code', async () => {
      const event = new ApiGatewayEventMock();

      const app = new GetByIdApp(tableName, repoMock.object());
      const response: ApiGatewayResponse = await app.run(event);

      expect(response).to.have.property("statusCode");
      expect(response.statusCode).to.equal(404);
    });

    it("repository is called to get a record by id", async () => {
      const note: NoteItem = {
        id: "123",
        text: "hello world",
        userId: 1,
        url: "google.com",
        group: "programming",
        numTimesConfirmed: 0,
        numTimesDenied: 0,
      };

      // Stub a getById invocation resolving a Promise with a valid NoteItem
      // instance from the data store
      const mock = new Mock<NoteRepository>()
        .setup((instance) => instance.getNoteById(It.IsAny(), tableName))
        .returns(
          new Promise<NoteItem>((resolve) => {
            resolve(note);
          })
        );

      const event = new ApiGatewayEventMock();
      event.pathParameters = { id: note.id };

      const app = new GetByIdApp(tableName, mock.object());
      const response: ApiGatewayResponse = await app.run(event);

      mock.verify(
        (instance) => instance.getNoteById(It.IsAny(), tableName),
        Times.Once()
      );
      if (!response.body) {
        expect.fail("expected a response body to be present");
      }

      const responseNote: NoteItem = JSON.parse(response.body) as NoteItem;
      expect(responseNote.id).to.equal(note.id);
    });
  });
});
