import "mocha";
import { expect } from "chai";
import { Mock, It, Times } from "moq.ts";

import { PostApp } from "../../src/apps/post-app";

// import { NoteItem } from "../../src/common/note-item";
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
      const app = new PostApp(tableName, repoMock.object());

      expect(app.table).to.equal(tableName);
    });

    it("repository is assigned", () => {
      const app = new PostApp(tableName, repoMock.object());

      expect(app.repository).to.equal(repoMock.object());
    });
  });

  describe("run", () => {
    it("invalid json body returns 400 status code", async () => {
      const event = new ApiGatewayEventMock();
      event.body = '{""}';

      const app = new PostApp(tableName, repoMock.object());
      const response: ApiGatewayResponse = await app.run(event);

      expect(response).to.have.property("statusCode");
      expect(response.statusCode).to.equal(400);
    });

    it('invalid note "title" returns 422 status code', async () => {
      const event = new ApiGatewayEventMock();
      event.body = '{"id":"1", "isComplete":"false"}';

      const app = new PostApp(tableName, repoMock.object());
      const response: ApiGatewayResponse = await app.run(event);

      expect(response).to.have.property("statusCode");
      expect(response.statusCode).to.equal(422);
    });

    it('invalid note "id" returns 422 status code', async () => {
      const event = new ApiGatewayEventMock();
      event.body = '{"title":"helloworld", "isComplete":"false"}';

      const app = new PostApp(tableName, repoMock.object());
      const response: ApiGatewayResponse = await app.run(event);

      expect(response).to.have.property("statusCode");
      expect(response.statusCode).to.equal(422);
    });

    it('missing note "isComplete" sets property to false', async () => {
      const event = new ApiGatewayEventMock();
      event.body = '{"title":"helloworld", "id":"1"}';

      const app = new PostApp(tableName, repoMock.object());
      const response: ApiGatewayResponse = await app.run(event);

      expect(response).to.have.property("statusCode");
      expect(response.statusCode).to.equal(201);
      expect(response).to.have.property("body");

      if (!response.body) {
        expect.fail("body was not returned in the response");
      }

      // const note: NoteItem = JSON.parse(response.body) as NoteItem;
      // expect(note.numTimesConfirmed).to.equal(false);
    });

    it("repository is called to store a single record", async () => {
      const mock = new Mock<NoteRepository>()
        .setup((instance) => instance.putNote(It.IsAny(), tableName))
        .returns(
          new Promise<void>((resolve) => {
            resolve();
          })
        );

      const event = new ApiGatewayEventMock();

      const app = new PostApp(tableName, mock.object());
      await app.run(event);

      mock.verify(
        (instance) => instance.putNote(It.IsAny(), tableName),
        Times.Once()
      );
    });

    it("repository issue returns 500 status code", async () => {
      // Stub our NoteRepository so it simulates a failed operation from the
      // underlying data store.
      const mock = new Mock<NoteRepository>()
        .setup((instance) => instance.putNote(It.IsAny(), tableName))
        .returns(
          new Promise<void>((resolve, reject) => {
            reject(new Error("unit test rejected Promise"));
          })
        );

      const event = new ApiGatewayEventMock();

      const app = new PostApp(tableName, mock.object());
      const response: ApiGatewayResponse = await app.run(event);

      expect(response).to.have.property("statusCode");
      expect(response.statusCode).to.equal(500);
    });
  });
});
