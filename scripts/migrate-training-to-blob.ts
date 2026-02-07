/**
 * Migration script: Upload static training documents from public/training/ to Vercel Blob
 * and create corresponding database records.
 *
 * Usage: npx tsx scripts/migrate-training-to-blob.ts
 *
 * Prerequisites:
 * - .env.local must contain BLOB_READ_WRITE_TOKEN and DATABASE_URL
 * - Prisma client must be generated (npx prisma generate)
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: join(__dirname, "..", ".env.local") });

const prisma = new PrismaClient();

interface StaticDocument {
  name: string;
  filename: string;
  type: string;
  category: string;
  description: string;
}

const staticDocuments: StaticDocument[] = [
  {
    name: "ProTech Roofing Training Week",
    filename: "ProTech Roofing Training Week.pptx",
    type: "pptx",
    category: "Core Training",
    description: "Complete training presentation for new team members",
  },
  {
    name: "Roofing Sales 101",
    filename: "Roofing Sales 101.pptx",
    type: "pptx",
    category: "Core Training",
    description: "Fundamentals of roofing sales",
  },
  {
    name: "ProTech Roofing Call Script",
    filename: "ProTech Roofing Call Script.docx",
    type: "docx",
    category: "Scripts",
    description: "Standard call script for customer outreach",
  },
  {
    name: "ProTech Roofing Call Script (Alternate)",
    filename: "ProTech Roofing Call Script (Evan Alternate).docx",
    type: "docx",
    category: "Scripts",
    description: "Alternative call script approach",
  },
  {
    name: "Fronter Script",
    filename: "Fronter Script.docx",
    type: "docx",
    category: "Scripts",
    description: "Script for fronter role",
  },
  {
    name: "ProTech Client Questions",
    filename: "ProTech Client Questions.docx",
    type: "docx",
    category: "Reference",
    description: "Common client questions and answers",
  },
  {
    name: "ProTech Price Guide",
    filename: "ProTech Price Guide.xlsx",
    type: "xlsx",
    category: "Reference",
    description: "Pricing reference guide",
  },
  {
    name: "Pitch Chart",
    filename: "Pitch Chart.png",
    type: "png",
    category: "Reference",
    description: "Visual pitch reference chart",
  },
  {
    name: "Roof Diagram",
    filename: "roof-diagram.png",
    type: "png",
    category: "Reference",
    description: "Roof structure diagram",
  },
  {
    name: "Auxiliary Tips, Tricks, and Information",
    filename: "informational-lessons/Auxiliary Tips, Trick, and Information.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Additional tips and helpful information",
  },
  {
    name: "Roofing Types and Differences",
    filename: "informational-lessons/Roofing Types and Differences.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Overview of different roofing types",
  },
  {
    name: "Selling Points",
    filename: "informational-lessons/Selling Points.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Key selling points for roofing services",
  },
  {
    name: "Training Links",
    filename: "informational-lessons/Training Links.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Collection of useful training resources",
  },
  {
    name: "Practice Measurements",
    filename: "practice-sheets/Practice Measurements.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Measurement practice exercises",
  },
  {
    name: "Practice Measurements II",
    filename: "practice-sheets/Practice Measurements II.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Advanced measurement practice",
  },
  {
    name: "Roofing Knowledge Inventory",
    filename: "practice-sheets/Roofing Knowledge Inventory.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Self-assessment quiz",
  },
  {
    name: "Training Call - Evan Clark & Delores Epps",
    filename: "training-calls/Evan Clark Delores Epps.mp3",
    type: "mp3",
    category: "Training Calls",
    description: "Recorded training call example",
  },
  {
    name: "Training Call - Evan Clark & Elizabeth Mazzola Part 1",
    filename: "training-calls/Evan Clark Elizabeth Mazzola Part 1.mp3",
    type: "mp3",
    category: "Training Calls",
    description: "Recorded training call example",
  },
];

async function migrate() {
  const publicDir = join(__dirname, "..", "public", "training");

  console.log(`Starting migration of ${staticDocuments.length} training documents...`);
  console.log(`Reading files from: ${publicDir}\n`);

  let uploaded = 0;
  let skipped = 0;
  let alreadyExists = 0;

  for (const doc of staticDocuments) {
    const filePath = join(publicDir, doc.filename);

    // Skip files that don't exist on disk
    if (!existsSync(filePath)) {
      console.log(`SKIP (not found): ${doc.filename}`);
      skipped++;
      continue;
    }

    // Check if already migrated (idempotent)
    const existing = await prisma.trainingDocument.findFirst({
      where: { name: doc.name },
    });

    if (existing) {
      console.log(`SKIP (already in DB): ${doc.name}`);
      alreadyExists++;
      continue;
    }

    // Read file from disk
    const fileBuffer = readFileSync(filePath);
    const fileSize = fileBuffer.length;

    // Generate a blob path matching the upload convention
    const sanitizedFilename = doc.filename
      .split("/")
      .pop()!
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100);
    const blobPath = `training/migration_${sanitizedFilename}`;

    console.log(`Uploading: ${doc.name} (${(fileSize / 1024).toFixed(1)} KB)...`);

    // Upload to Vercel Blob
    const blob = await put(blobPath, fileBuffer, {
      access: "public",
      addRandomSuffix: true,
    });

    // Create database record
    await prisma.trainingDocument.create({
      data: {
        name: doc.name,
        filename: doc.filename.split("/").pop() || doc.filename,
        storedName: blob.url,
        type: doc.type,
        category: doc.category,
        description: doc.description,
        fileSize,
        uploadedBy: "system-migration",
      },
    });

    console.log(`  -> Uploaded to: ${blob.url}`);
    uploaded++;
  }

  console.log(`\nMigration complete!`);
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped (not found): ${skipped}`);
  console.log(`  Skipped (already in DB): ${alreadyExists}`);
  console.log(`  Total: ${uploaded + skipped + alreadyExists}`);

  await prisma.$disconnect();
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  prisma.$disconnect();
  process.exit(1);
});
