export function isEnterKeyPressed(event: React.KeyboardEvent): boolean {
  return event.code === 'Enter';
}

export function getLocaleString(dateString: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}
