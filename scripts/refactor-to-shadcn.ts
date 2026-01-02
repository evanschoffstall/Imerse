#!/usr/bin/env bun
/**
 * Automated refactor script to replace custom components with shadcn/ui
 * This script systematically updates all forms and components to use shadcn/ui patterns
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const componentsDir = join(process.cwd(), "components");
const formsDir = join(componentsDir, "forms");

// Replacements to apply across all files
const globalReplacements = [
  // Replace custom FormField import with shadcn Form components
  {
    from: /import FormField from ['"]@\/components\/ui\/FormField['"]/g,
    to: `import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'`,
  },

  // Replace native select elements with shadcn Select
  {
    from: /<select\s+{\.\.\.register\(['"](\w+)['"]\)}\s+className="[^"]*">/g,
    to: (match: string, fieldName: string) => {
      return `<Select onValueChange={(value) => form.setValue('${fieldName}', value)} defaultValue={form.watch('${fieldName}')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>`;
    },
  },

  // Replace custom checkbox styling
  {
    from: /className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded[^"]*"/g,
    to: "",
  },

  // Replace custom button styling (indigo) with shadcn button variants
  {
    from: /className="[^"]*bg-indigo-600[^"]*"/g,
    to: "",
  },

  // Replace gray button classes
  {
    from: /className="[^"]*border border-gray-300[^"]*bg-white[^"]*"/g,
    to: 'variant="outline"',
  },
];

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentPath: string) {
    const items = readdirSync(currentPath);

    for (const item of items) {
      const fullPath = join(currentPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && item !== "ui") {
        // Skip the ui folder as it contains shadcn components
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function refactorFile(filePath: string) {
  let content = readFileSync(filePath, "utf-8");
  let modified = false;

  // Check if file uses old FormField pattern
  if (content.includes("import FormField from")) {
    console.log(`Refactoring: ${filePath}`);

    // Apply all global replacements
    for (const replacement of globalReplacements) {
      if (typeof replacement.to === "string") {
        const newContent = content.replace(replacement.from, replacement.to);
        if (newContent !== content) {
          modified = true;
          content = newContent;
        }
      }
    }

    // Convert register pattern to Form pattern (manual inspection still needed)
    if (content.includes("register(")) {
      console.warn(`  ⚠️  Manual review needed: Still uses register() pattern`);
    }

    if (modified) {
      writeFileSync(filePath, content, "utf-8");
      console.log(`  ✓ Updated: ${filePath}`);
    }
  }

  return modified;
}

// Main execution
console.log("🚀 Starting shadcn/ui refactor...\n");

const allFiles = getAllTsxFiles(componentsDir);
let totalModified = 0;

for (const file of allFiles) {
  if (refactorFile(file)) {
    totalModified++;
  }
}

console.log(`\n✅ Refactor complete!`);
console.log(`   Modified ${totalModified} files`);
console.log(`\n⚠️  Manual review required for:`);
console.log(`   - Form field conversions (register → FormField render)`);
console.log(`   - Select element conversions`);
console.log(`   - Custom styled inputs`);
