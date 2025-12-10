export const formDataParser = async (request: Request): Promise<any> => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  return data;
};
