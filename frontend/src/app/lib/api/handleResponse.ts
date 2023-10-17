export async function extractResponseInfo<ResBody = unknown>(response: Response) {
  const { headers, ok, status, statusText } = response;
  let responseBody, error;

  try {
    responseBody = await response.json() as ResBody;
  } catch (err) {
    error = {
      status: "error",
      message: err,
    };
  }

  return {
    responseBody,
    error,
    headers,
    ok,
    status,
    statusText
  }
}