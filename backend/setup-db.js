import { initializeDatabase } from "./src/config/initDb.js";

console.log("🔧 Running database setup...\n");

initializeDatabase()
  .then(() => {
    console.log("\n✅ Database setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Database setup failed:", error.message);
    process.exit(1);
  });
