import fs from "fs";

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function readDir(dirPath: string): string[] {
  return fs.readdirSync(dirPath);
}

export function writeFile(filePath: string, content: string) {
  return fs.writeFileSync(filePath, content, "utf-8");
}

export function isDirectory(dirPath: string): boolean {
  return fs.statSync(dirPath).isDirectory();
}
