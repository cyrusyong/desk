export const handler = async (event) => {
  // TODO implement
  //
  // Test Comment for actions
  const body = JSON.parse(event.body);

  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };
  return response;
};
