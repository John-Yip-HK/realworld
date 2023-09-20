export function handleError(error: unknown, callback: (error: Error) => void) {
  if (!(error instanceof Error)) {
    return;
  }

  callback(error);
}