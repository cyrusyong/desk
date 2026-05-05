import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const dynamo = new DynamoDBClient({ region: "us-east-2" });
const doc = DynamoDBDocumentClient.from(dynamo);
const s3 = new S3Client({ region: "us-east-2" });

const BUCKET = "droplet.app";
const TABLE = "S3_Metadata";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        ...CORS,
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  let simpleID;
  try {
    ({ simpleID } = JSON.parse(event.body));
  } catch {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  if (!simpleID) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "simpleID is required" }),
    };
  }

  const existing = await doc.send(
    new GetCommand({ TableName: TABLE, Key: { simpleID } })
  );

  if (!existing.Item || existing.Item.deleted) {
    return {
      statusCode: 404,
      headers: CORS,
      body: JSON.stringify({ error: "File not found" }),
    };
  }

  const fieldID = existing.Item.fieldID;

  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { simpleID },
      UpdateExpression: "SET #d = :d",
      ExpressionAttributeNames: { "#d": "deleted" },
      ExpressionAttributeValues: { ":d": true },
    })
  );

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: fieldID }));

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true }),
  };
};
