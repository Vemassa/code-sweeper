import yargs from "yargs";
import { readFile } from "./fs";
import { link, success, underline, warning } from "./log";
import {
  getAllFiles,
  isConstantsFile,
  removeDeclarationsFromFile,
} from "./fileUtils";
import { findImports, findUnusedVariablesInFile, parseFile } from "./parseUtils";

type DeclarationMap = {
  [key: string]: string[];
};

interface CodeSweeperArgs {
  clean: boolean;
  deepCheck: boolean;
  _: string[];
  $0: string; // The script name or path
}

async function main(argv: CodeSweeperArgs) {
  const path = argv._[0] || '.';
  const files = getAllFiles(path, []);
  const unusedDeclarationsByFile: DeclarationMap = {};
  let fileCount = 0;
  let variableCount = 0;

  // Parses all constants files and store their variable declarations
  files.forEach((file) => {
    if (isConstantsFile(file)) {
      const content = readFile(file);
      const ast = parseFile(content, ["jsx"]);

      const unusedDeclarations = findUnusedVariablesInFile(ast, argv.deepCheck);

      unusedDeclarationsByFile[file] = unusedDeclarations;
    }
  });

  files.forEach((file) => {
    const declarations: string[] = Object.values(
      unusedDeclarationsByFile,
    ).flat();
    const content = readFile(file);
    const imports = findImports(content, declarations);

    imports.forEach((declaration) => {
      const declarationFile = Object.keys(unusedDeclarationsByFile).find(
        (file) => unusedDeclarationsByFile[file].includes(declaration),
      );

      if (declarationFile) {
        unusedDeclarationsByFile[declarationFile] = unusedDeclarationsByFile[
          declarationFile
        ].filter((decl) => decl !== declaration);
      }
    });
  });

  Object.keys(unusedDeclarationsByFile).forEach((file) => {
    let output = "";

    if (unusedDeclarationsByFile[file].length > 0) {
      console.log(underline(file));
      
      unusedDeclarationsByFile[file].forEach((declaration) => {
        if (argv.clean) {
          output += `${success("removed")}\tdeclaration '${declaration}'\n`;
        } else {
          output += `${warning("warning")}\tdeclaration '${declaration}' not used within other modules\n`;
        }

        variableCount++;
      });

      console.log(output);
    }

    if (argv.clean && unusedDeclarationsByFile[file].length > 0) {
       removeDeclarationsFromFile(file, unusedDeclarationsByFile[file]);
       fileCount++;
    }
  });

  if (argv.clean) {
    console.log(success(`Removed ${variableCount} declarations from ${fileCount} files`));
  } else if (variableCount === 0) {
    console.log(success("No unused declarations found"));
  } else {
    console.log(warning(`Found ${variableCount} unused declarations, run with the --clean flag to remove`));
  }

  console.log(link(`\nFeel free to contribute to this project at ${underline("https://github.com/Vemassa/code-sweeper")}`));
}

const argv = yargs
  .scriptName('code-sweeper')
  .usage('$0 [options]')
  .option('clean', {
    describe: 'Perform a standard clean-up operation',
    type: 'boolean',
    default: false,
  })
  .option('deep-check', {
    describe: 'Perform a deep check of the code for issues, typically detects declarations that would also become unused after a clean-up',
    type: 'boolean',
    default: false,
  })
  .help('help')
  .alias('help', 'h')
  .example([
    ['$0 --clean', 'Perform a standard clean-up operation'],
    ['$0 --deep-check', 'Perform a deep check of the code for issues, typically detects declarations that would also become unused after a clean-up']
  ])
  .wrap(yargs.terminalWidth())
  .parse();

main(argv as CodeSweeperArgs);