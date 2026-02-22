export function addOrUpdateUrlParam(name: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.location.href = url.toString();
}