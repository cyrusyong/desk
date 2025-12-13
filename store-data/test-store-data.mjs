import { handler } from "./index.mjs";

const event = {
  body: JSON.stringify({
    fieldID: "afweg321",
    fileName: "Cyrus_Yong.pdf",
    fileExtension: "application/pdf",
    fileSize: 20132,
  }),
};

handler(event).then(console.log).catch(console.error);
