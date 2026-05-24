#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

process.stdout.on("error", error => {
  if (error.code === "EPIPE") {
    process.exit(0);
  }
  throw error;
});

const ngrxExamplesRoot = path.join(repoRoot, "packages", "examples", "ngrx");
const reduxExamplesRoot = path.join(repoRoot, "packages", "examples", "redux");

const isTsComponentFile = fileName => fileName.endsWith(".ts") && !fileName.endsWith(".view.ts");

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(rootPath) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

async function collectComponentTsFiles(componentsRoot) {
  const files = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (entry.isFile() && isTsComponentFile(entry.name)) {
        files.push(absolutePath);
      }
    }
  }

  await walk(componentsRoot);
  return files;
}

async function copyNgRxComponentsToRedux() {
  const ngrxExamples = await listDirectories(ngrxExamplesRoot);

  let copiedCount = 0;
  let overwrittenCount = 0;
  let skippedExamples = 0;

  for (const exampleName of ngrxExamples) {
    const ngrxComponentsRoot = path.join(ngrxExamplesRoot, exampleName, "src", "components");
    const reduxComponentsRoot = path.join(reduxExamplesRoot, exampleName, "src", "components");

    if (!(await exists(ngrxComponentsRoot))) {
      continue;
    }

    if (!(await exists(reduxComponentsRoot))) {
      skippedExamples += 1;
      console.log(`[SKIP] Redux target not found for example \"${exampleName}\": ${reduxComponentsRoot}`);
      continue;
    }

    const sourceFiles = await collectComponentTsFiles(ngrxComponentsRoot);

    for (const sourceFile of sourceFiles) {
      const relativePath = path.relative(ngrxComponentsRoot, sourceFile);
      const targetFile = path.join(reduxComponentsRoot, relativePath);
      const targetDir = path.dirname(targetFile);

      await fs.mkdir(targetDir, { recursive: true });

      const targetAlreadyExists = await exists(targetFile);
      await fs.copyFile(sourceFile, targetFile);

      if (targetAlreadyExists) {
        overwrittenCount += 1;
        console.log(`[OVERWRITE] ${targetFile} <- ${sourceFile}`);
      } else {
        copiedCount += 1;
        console.log(`[COPY] ${targetFile} <- ${sourceFile}`);
      }
    }
  }

  console.log("\nDone.");
  console.log(`Copied new files: ${copiedCount}`);
  console.log(`Overwritten files: ${overwrittenCount}`);
  console.log(`Skipped examples (missing redux target): ${skippedExamples}`);
}

copyNgRxComponentsToRedux().catch(error => {
  console.error("[ERROR] Failed to copy components.");
  console.error(error);
  process.exitCode = 1;
});


