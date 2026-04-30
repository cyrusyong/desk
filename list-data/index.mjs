import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-2" });
const doc_client = new DynamoDBDocumentClient(client);

export const handler = async (event) => {
  const trackingNumber = event?.queryStringParameters?.trackingNumber;

  if (!trackingNumber) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "trackingNumber query param is required" }),
    };
  }

  try {
    const data = await doc_client.send(
      new QueryCommand({
        TableName: "S3_Metadata",
        IndexName: "trackingNumber_index",
        KeyConditionExpression: "trackingNumber = :tn",
        ExpressionAttributeValues: { ":tn": trackingNumber },
      })
    );

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ items: data.Items || [] }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
