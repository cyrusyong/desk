export const handler = async (event) => {
  // TODO implement
  const body = JSON.parse(event.body);
  console.log("hello thereee");

  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };
  return response;
};
