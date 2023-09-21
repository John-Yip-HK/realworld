export async function extractResponseInfo<ResBody = unknown>(response: Response) {
  const responseBody: ResBody = await response.json();
  const { headers, ok, status, statusText } = response;

  return {
    responseBody,
    headers,
    ok,
    status,
    statusText
  }
}