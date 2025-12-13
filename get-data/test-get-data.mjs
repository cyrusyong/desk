import { handler } from "./index.mjs";

const event = {
  parameters: {
    id: "qqb2RE",
  },
};

handler(event)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
