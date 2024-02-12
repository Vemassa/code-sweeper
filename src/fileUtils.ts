import path from "path";
import { isDirectory, readDir, readFile, writeFile } from "./fs";
import { success } from "./log";

const IGNORED_DIRECTORIES = ["node_modules", "dist", "build"];
const ALLOWED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

export function isDirectoryIgnored(dirName: string): boolean {
  return dirName.startsWith(".") || IGNORED_DIRECTORIES.includes(dirName);
}

export function isFileIgnored(fileName: string): boolean {
  return !ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

// Arbitrary checks for constants file, let's improve this later
export function isConstantsFile(fileName: string): boolean {
  return (
    fileName.includes("constants") &&
    (fileName.endsWith(".js") || fileName.endsWith(".ts"))
  );
}

/**
 * Recursively get all .js and .ts files in a directory, excluding specified directories.
 * @param {string} dirPath - The path to the directory to start searching from.
 * @param {Array<string>} [arrayOfFiles=[]] - Accumulator for files found.
 * @returns {Array<string>} An array of file paths.
 */
export function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = [],
): Array<string> {
  const files: string[] = readDir(dirPath);

  if (!files) return arrayOfFiles;

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (isDirectory(fullPath)) {
      if (!isDirectoryIgnored(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (
      fullPath.endsWith(".js") ||
      fullPath.endsWith(".jsx") ||
      fullPath.endsWith(".ts") ||
      fullPath.endsWith(".tsx")
    ) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

export function removeDeclarationsFromFile(
  filePath: string,
  constants: string[],
) {
  if (constants.length === 0) return;

  const fileContent = readFile(filePath);
  // Convert the file content into an array of lines
  const lines = fileContent.split('\n');
  // Prepare a regular expression to match any of the constants
  const constantsRegex = new RegExp(`\\b(${constants.join('|')})\\b`, 'g');
  // Filter out lines containing any of the constants
  const filteredLines = lines.filter(line => !constantsRegex.test(line));
  // Join the remaining lines back into a single string
  const newFileContent = filteredLines.join('\n');

  console.log(success(`Removed declarations from ${filePath}`));

  writeFile(filePath, newFileContent);
}
