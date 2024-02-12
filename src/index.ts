import { readFile } from "./fs";
import { underline, warning } from "./log";
import {
  getAllFiles,
  isConstantsFile,
  removeDeclarationsFromFile,
} from "./fileUtils";
import { findImports, parseVariableDeclaration } from "./parseUtils";

const args = process.argv.slice(2);
const CLEAN = args.includes("--clean");
const SEARCH_PATH = args.find((arg) => !arg.startsWith("--")) || ".";

type DeclarationMap = {
  [key: string]: string[];
};

async function main(directory: string) {
  const files = getAllFiles(directory, []);
  const variableDeclarationsMap: DeclarationMap = {};

  files.forEach((file) => {
    if (isConstantsFile(file)) {
      const content = readFile(file);
      const variableDeclarations = parseVariableDeclaration(content);
      variableDeclarationsMap[file] = variableDeclarations;
    }
  });

  files.forEach((file) => {
    const declarations: string[] = Object.values(
      variableDeclarationsMap,
    ).flat();
    const content = readFile(file);
    const foundImports = findImports(content, declarations);

    foundImports.forEach((declaration) => {
      const declarationFile = Object.keys(variableDeclarationsMap).find(
        (file) => variableDeclarationsMap[file].includes(declaration),
      );

      if (declarationFile) {
        variableDeclarationsMap[declarationFile] = variableDeclarationsMap[
          declarationFile
        ].filter((decl) => decl !== declaration);
      }
    });
  });

  Object.keys(variableDeclarationsMap).forEach((file) => {
    if (variableDeclarationsMap[file].length > 0) {
      console.log(underline(file));
      variableDeclarationsMap[file].forEach((declaration) => {
        console.log(
          `${warning("warning")}\tdeclaration '${declaration}' not used within other modules\n`,
        );
      });
    }

    if (CLEAN) {
      removeDeclarationsFromFile(file, variableDeclarationsMap[file]);
    }
  });

  if (Object.keys(variableDeclarationsMap).length === 0 && !CLEAN) {
    console.log(`To remove unused declarations, run with the --clean flag`);
  }
}

main(SEARCH_PATH);
