export const formDataParser = async (request: Request) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  return data;
};
