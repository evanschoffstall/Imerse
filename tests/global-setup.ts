import { type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  // For now, we'll skip authentication setup
  // This can be expanded later when auth is needed
  console.log("Global setup complete");
}

export default globalSetup;
