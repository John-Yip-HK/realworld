export async function extractResponseInfo<ResBody = any>(response: Response) {
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