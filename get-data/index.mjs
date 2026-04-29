import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const dynamo = new DynamoDBDocumentClient(
  new DynamoDBClient({ region: "us-east-2" })
);
const s3 = new S3Client({ region: "us-east-2" });

export const handler = async (event) => {
  const id = event.queryStringParameters.id;

  try {
    const data = await dynamo.send(new GetCommand({
      TableName: "S3_Metadata",
      Key: { simpleID: id },
    }));

    const item = data.Item;
    const fieldID = item.fieldID;

    const object_url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: "droplet.app", Key: fieldID }),
      { expiresIn: 3600 }
    );

    item.object_url = object_url;

    return { statusCode: 200, body: JSON.stringify({ body: { Item: item } }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: e.message }) };
  }
};
