import { nanoid } from "nanoid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
});
const doc_client = new DynamoDBDocumentClient(client);

export const handler = async (event) => {
  // TODO implement
  const body = JSON.parse(event.body);
  // create JSON body with simpleID, fieldID, fileName, fileSize, uploadTimestamp
  // and send it to DB
  const simpleID = nanoid(6);

  const params = {
    TableName: "S3_Metadata",
    Item: {
      simpleID: simpleID,
      fieldID: body.fieldID,
      fileName: body.fileName,
      fileExtension: body.fileExtension,
      fileSize: body.fileSize,
      TTL: Math.floor(Date.now() / 1000) + 120, // 2 minutes from now
    },
  };

  try {
    await doc_client.send(new PutCommand(params));

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        simpleID: simpleID,
      }),
    };

    return response;
  } catch (e) {
    return e;
  }
};
