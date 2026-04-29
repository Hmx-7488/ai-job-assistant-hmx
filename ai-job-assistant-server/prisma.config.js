require("dotenv/config");
const { defineConfig } = require("prisma/config");

const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.DATABASE_PRIVATE_URL?.trim() ||
  process.env.DATABASE_PUBLIC_URL?.trim() ||
  "";

if (!databaseUrl) {
  console.error(
    "Warning: No DATABASE_URL set. Using placeholder for build."
  );
}

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      databaseUrl || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
