export async function extractResponseInfo<ResBody = unknown>(response: Response) {
  const { headers, ok, status, statusText } = response;
  let responseBody, error;
  
  try {
    responseBody = await response.json() satisfies ResBody;
  } catch {
    error = {
      status: "error",
      message: statusText,
    };
  }

  return {
    responseBody: responseBody ?? error,
    headers,
    ok,
    status,
    statusText
  }
}