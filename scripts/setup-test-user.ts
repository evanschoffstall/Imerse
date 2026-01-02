/**
 * Test User Setup Script
 *
 * Creates or retrieves a superuser test account for E2E testing.
 * This user has full permissions and can be used to bypass authentication
 * during automated tests.
 *
 * Usage:
 *   bun run scripts/setup-test-user.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// @ts-ignore - pg ESM types issue with @types/pg
import { Pool } from "pg";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

interface TestUserConfig {
  email: string;
  password: string;
  name: string;
}

/**
 * Get test user configuration from environment variables
 */
function getTestUserConfig(): TestUserConfig {
  const email = process.env.TEST_USER_EMAIL || "test@imerse.dev";
  const password = process.env.TEST_USER_PASSWORD || "TestPassword123!";
  const name = process.env.TEST_USER_NAME || "Test Superuser";

  return { email, password, name };
}

/**
 * Create or update the test superuser account
 */
async function setupTestUser() {
  const config = getTestUserConfig();

  console.log("🔧 Setting up test user...");
  console.log(`   Email: ${config.email}`);
  console.log(`   Name: ${config.name}`);

  // Hash the password
  const hashedPassword = await bcrypt.hash(config.password, 10);

  // Upsert the test user
  const user = await prisma.user.upsert({
    where: { email: config.email },
    update: {
      password: hashedPassword,
      name: config.name,
    },
    create: {
      email: config.email,
      password: hashedPassword,
      name: config.name,
    },
  });

  console.log("✅ Test user ready!");
  console.log(`   User ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log("");
  console.log("💡 You can now use this account in your E2E tests");
  console.log(`   Email: ${config.email}`);
  console.log(`   Password: ${config.password}`);

  return user;
}

/**
 * Verify test user exists and can authenticate
 */
async function verifyTestUser() {
  const config = getTestUserConfig();

  const user = await prisma.user.findUnique({
    where: { email: config.email },
  });

  if (!user) {
    console.error("❌ Test user not found");
    return false;
  }

  const passwordValid = await bcrypt.compare(config.password, user.password);

  if (!passwordValid) {
    console.error("❌ Test user password is invalid");
    return false;
  }

  console.log("✅ Test user verified successfully");
  return true;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check if TEST_MODE is enabled
    if (process.env.TEST_MODE !== "true") {
      console.warn("⚠️  TEST_MODE is not enabled in .env file");
      console.warn('   Set TEST_MODE="true" to enable test user creation');
      console.warn(
        "   This should only be enabled in development/testing environments!"
      );
      process.exit(1);
    }

    // Setup the test user
    await setupTestUser();

    // Verify it works
    await verifyTestUser();

    console.log("");
    console.log("🎉 Test user setup complete!");
  } catch (error) {
    console.error("❌ Error setting up test user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { getTestUserConfig, setupTestUser, verifyTestUser };
