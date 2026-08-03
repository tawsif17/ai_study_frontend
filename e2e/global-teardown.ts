export default async function globalTeardown() {
  try {
    await fetch("http://127.0.0.1:3100/__playwright_shutdown", {
      method: "POST",
      signal: AbortSignal.timeout(2_000),
    })
  } catch {
    // The server may finish closing before the response reaches the runner.
  }
}
