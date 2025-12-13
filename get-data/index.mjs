import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  route: "us-east-2",
});

const doc_client = new DynamoDBDocumentClient(client);

export const handler = async (event) => {
  const id = event.parameters.id;

  const params = {
    TableName: "S3_Metadata",
    Key: {
      simpleID: id,
    },
  };

  try {
    const data = await doc_client.send(new GetCommand(params));
    const fieldID = data.Item.fieldID;

    data.Item["object_url"] =
      `https://s3.us-east-2.amazonaws.com/droplet.app/${fieldID}`;

    return { status: 200, body: data };
  } catch (e) {
    return e;
  }
};
