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

const frameworkRoots = {
  ngrx: path.join(repoRoot, "packages", "examples", "ngrx"),
  redux: path.join(repoRoot, "packages", "examples", "redux"),
};

const supportedFrameworks = new Set(Object.keys(frameworkRoots));

const isStateManagerAgnosticFile = fileName =>
  fileName.endsWith(".ts") &&
  !fileName.endsWith(".view.ts") &&
  !fileName.endsWith(".component.ts");

function parseArgs(argv) {
  const options = {
    from: "ngrx",
    to: "redux",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      return { ...options, help: true };
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--from=")) {
      options.from = arg.slice("--from=".length);
      continue;
    }

    if (arg === "--from") {
      options.from = argv[++index];
      continue;
    }

    if (arg.startsWith("--to=")) {
      options.to = arg.slice("--to=".length);
      continue;
    }

    if (arg === "--to") {
      options.to = argv[++index];
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function validateFrameworkName(frameworkName, flagName) {
  if (!supportedFrameworks.has(frameworkName)) {
    throw new Error(
      `Invalid ${flagName} framework: ${frameworkName}. Supported values: ${[
        ...supportedFrameworks,
      ].join(", ")}`,
    );
  }

  return frameworkName;
}

function getFrameworkLabel(frameworkName) {
  return frameworkName.toUpperCase();
}

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

      if (entry.isFile() && isStateManagerAgnosticFile(entry.name)) {
        files.push(absolutePath);
      }
    }
  }

  await walk(componentsRoot);
  return files;
}

async function copyComponents({ from, to, dryRun }) {
  const sourceRoot = frameworkRoots[from];
  const targetRoot = frameworkRoots[to];
  const sourceExamples = await listDirectories(sourceRoot);

  let copiedCount = 0;
  let overwrittenCount = 0;
  let skippedExamples = 0;

  for (const exampleName of sourceExamples) {
    const sourceComponentsRoot = path.join(
      sourceRoot,
      exampleName,
      "src",
      "components",
    );
    const targetComponentsRoot = path.join(
      targetRoot,
      exampleName,
      "src",
      "components",
    );

    if (!(await exists(sourceComponentsRoot))) {
      continue;
    }

    if (!(await exists(targetComponentsRoot))) {
      skippedExamples += 1;
      console.log(
        `[SKIP] ${getFrameworkLabel(to)} target not found for example \"${exampleName}\": ${targetComponentsRoot}`,
      );
      continue;
    }

    const sourceFiles = await collectComponentTsFiles(sourceComponentsRoot);

    for (const sourceFile of sourceFiles) {
      const relativePath = path.relative(sourceComponentsRoot, sourceFile);
      const targetFile = path.join(targetComponentsRoot, relativePath);
      const targetDir = path.dirname(targetFile);

      const targetAlreadyExists = await exists(targetFile);
      if (!dryRun) {
        await fs.mkdir(targetDir, { recursive: true });
        await fs.copyFile(sourceFile, targetFile);
      }

      if (targetAlreadyExists) {
        overwrittenCount += 1;
        console.log(
          `${dryRun ? "[DRY RUN][OVERWRITE]" : "[OVERWRITE]"} ${targetFile} <- ${sourceFile}`,
        );
      } else {
        copiedCount += 1;
        console.log(
          `${dryRun ? "[DRY RUN][COPY]" : "[COPY]"} ${targetFile} <- ${sourceFile}`,
        );
      }
    }
  }

  console.log("\nDone.");
  console.log(`${dryRun ? "Planned" : "Copied"} new files: ${copiedCount}`);
  console.log(
    `${dryRun ? "Planned" : "Overwritten"} files: ${overwrittenCount}`,
  );
  console.log(
    `Skipped examples (missing ${getFrameworkLabel(to)} target): ${skippedExamples}`,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(
      `Usage: node maintenance/copy-components.mjs [--from ngrx|redux] [--to ngrx|redux] [--dry-run]\n\nExamples:\n  node maintenance/copy-components.mjs\n  node maintenance/copy-components.mjs --from redux --to ngrx\n  node maintenance/copy-components.mjs --from ngrx --to redux --dry-run`,
    );
    return;
  }

  const from = validateFrameworkName(options.from, "--from");
  const to = validateFrameworkName(options.to, "--to");

  if (from === to) {
    throw new Error("--from and --to must be different frameworks.");
  }

  await copyComponents({ from, to, dryRun: options.dryRun });
}

main().catch(error => {
  console.error("[ERROR] Failed to copy components.");
  console.error(error);
  process.exitCode = 1;
});
