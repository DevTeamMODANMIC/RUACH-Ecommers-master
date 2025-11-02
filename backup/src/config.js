let config = null;

export async function loadConfig() {
  const response = await fetch("/config.json");
  config = await response.json();
}

export function getConfig() {
  return config;
}