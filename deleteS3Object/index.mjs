import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-east-2" });
const BUCKET = "droplet.app";

export const handler = async (event) => {
  for (const record of event.Records) {
    // Only process TTL-triggered deletions from DynamoDB
    if (
      record.eventName !== "REMOVE" ||
      record.userIdentity?.type !== "Service" ||
      record.userIdentity?.principalId !== "dynamodb.amazonaws.com"
    ) {
      continue;
    }

    const oldImage = record.dynamodb?.OldImage;
    if (!oldImage?.fieldID?.S) {
      console.log("No fieldID in record, skipping");
      continue;
    }

    const fieldID = oldImage.fieldID.S;

    try {
      await s3Client.send(
        new DeleteObjectCommand({ Bucket: BUCKET, Key: fieldID })
      );
      console.log(`Deleted S3 object: ${fieldID}`);
    } catch (err) {
      console.error(`Failed to delete S3 object ${fieldID}:`, err);
      throw err;
    }
  }
};
