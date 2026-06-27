#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const SRC_DIR = join(process.cwd(), "src");
const I18N_DIR = join(SRC_DIR, "i18n");
const EN_FILE = join(I18N_DIR, "en.json");

const errors = [];

if (!existsSync(EN_FILE)) {
  errors.push("Missing src/i18n/en.json — default translation file not found");
}

// Discover every locale dictionary (en.json, id.json, ...) and validate that
// each one is in key parity with the English (default) source. This keeps the
// validator working no matter how many locales the project adds.
let en = {};
const localeFiles = existsSync(I18N_DIR)
  ? readdirSync(I18N_DIR).filter((f) => f.endsWith(".json"))
  : [];

try {
  en = JSON.parse(readFileSync(EN_FILE, "utf8"));
} catch (error) {
  errors.push(`Failed to load en.json: ${error.message}`);
}

const enKeys = Object.keys(en);

for (const file of localeFiles) {
  if (file === "en.json") continue;
  const locale = basename(file, ".json");
  let dict = {};
  try {
    dict = JSON.parse(readFileSync(join(I18N_DIR, file), "utf8"));
  } catch (error) {
    errors.push(`Failed to load ${file}: ${error.message}`);
    continue;
  }
  for (const key of enKeys) {
    if (!(key in dict)) {
      errors.push(`Missing ${locale} translation key: ${key}`);
    }
  }
  for (const key of Object.keys(dict)) {
    if (!(key in en)) {
      errors.push(`Extra ${locale} key missing from English source: ${key}`);
    }
  }
}

const helpersExist =
  existsSync(join(I18N_DIR, "routes.ts")) &&
  existsSync(join(I18N_DIR, "switcher.ts")) &&
  existsSync(join(I18N_DIR, "ui.ts"));
if (!helpersExist) {
  errors.push(
    "Missing i18n helpers: src/i18n/routes.ts, src/i18n/switcher.ts, or src/i18n/ui.ts not found",
  );
}

if (errors.length > 0) {
  console.error("❌ I18n validation failed:");
  for (const err of errors) {
    console.error(`   - ${err}`);
  }
  process.exit(1);
} else {
  const count = localeFiles.length;
  console.log(
    `✅ I18n validation passed — ${count} locale dictionar${count === 1 ? "y" : "ies"} in sync`,
  );
}
