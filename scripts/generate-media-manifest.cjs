/**
 * generate-media-manifest.cjs
 * Build-time script that extracts all media references from content entries
 * and writes them to dist/media-manifest.json for use by the cleanup worker.
 *
 * Run after `astro build`:
 *   node scripts/generate-media-manifest.cjs
 *
 * The manifest is an array of R2 object keys referenced by published content.
 */

const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "src", "content");
const OUTPUT_DIR = path.join(__dirname, "..", "dist");
const MANIFEST_FILE = "media-manifest.json";

// File extensions to scan for media references
const MEDIA_EXTENSIONS = [".md", ".yml", ".yaml", ".json"];

// Field names that may contain media references
const MEDIA_FIELDS = [
  "mediaReferences",
  "image",
  "ogImage",
  "logo",
  "favicon",
  "icon",
  "avatar",
  "heroImage",
  "cardImage",
  "thumbnail",
];

function walkDir(dir) {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walkDir(fullPath));
      } else if (MEDIA_EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory might not exist
  }
  return files;
}

function extractMediaReferences(filePath) {
  const references = [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // For markdown files, extract frontmatter
    if (filePath.endsWith(".md")) {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        // Simple YAML field extraction for known media fields
        for (const field of MEDIA_FIELDS) {
          const regex = new RegExp(`^${field}[\\s:]+["']?(.+?)["']?$`, "gm");
          let match;
          while ((match = regex.exec(frontmatterMatch[1])) !== null) {
            const value = match[1].trim();
            if (value && !value.startsWith("http") && value !== "null" && value !== "''") {
              references.push(value);
            }
          }
        }

        // Also check for mediaReferences array in frontmatter
        const arrayMatch = frontmatterMatch[1].match(/mediaReferences:\s*\n((?:\s+-\s+.+\n?)*)/);
        if (arrayMatch) {
          const items = arrayMatch[1].match(/-\s+["']?(.+?)["']?$/gm);
          if (items) {
            for (const item of items) {
              references.push(item.replace(/^-\s+/, "").replace(/["']/g, "").trim());
            }
          }
        }
      }
    }

    // Check YAML files for direct field references
    if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) {
      for (const field of MEDIA_FIELDS) {
        const regex = new RegExp(`^${field}[\\s:]+["']?(.+?)["']?$`, "gm");
        let match;
        while ((match = regex.exec(content)) !== null) {
          const value = match[1].trim();
          if (value && !value.startsWith("http") && value !== "null" && value !== "''") {
            references.push(value);
          }
        }
      }
    }
  } catch {
    // Skip unreadable files
  }
  return references;
}

function main() {
  console.log("Generating media manifest...");

  const contentFiles = walkDir(CONTENT_DIR);
  const allReferences = new Set();

  for (const file of contentFiles) {
    const refs = extractMediaReferences(file);
    for (const ref of refs) {
      if (ref.startsWith("uploads/")) {
        allReferences.add(ref);
      }
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest = Array.from(allReferences).sort();
  const outputPath = path.join(OUTPUT_DIR, MANIFEST_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

  console.log(`Media manifest generated: ${manifest.length} references`);
  console.log(`Output: ${outputPath}`);
}

main();
