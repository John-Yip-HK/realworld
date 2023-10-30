export const getFormDataAttributeFunc = (formData: FormData) => 
  (attribute: string) => formData.get(attribute)?.toString() ?? null;