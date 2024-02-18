import traverse from "@babel/traverse";
import * as parser from "@babel/parser";
import { File } from "@babel/types";

export function parseFile(
  content: string,
  plugins?: parser.ParserOptions["plugins"],
): parser.ParseResult<File> {
  return parser.parse(content, {
    sourceType: "module",
    plugins: ["typescript", ...(plugins || [])],
  });
}

export function findUnusedVariablesInFile(ast: parser.ParseResult<File>, deepCheck?: boolean) {
  const removed: string[] = []
  let isRemovalPerformed: boolean = false;

  do {
    // Resets flag for each iteration
    isRemovalPerformed = false;

    // Maps and sets to track variable declarations and usages
    const declaredVariables = new Map();
    const usedVariables = new Set();

    // Traverses the AST to populate declaredVariables and usedVariables
    traverse(ast, {
      VariableDeclarator(path) {
        if (path.node.id.type === "Identifier") {
          declaredVariables.set(path.node.id.name, path);
        }
      },
      ReferencedIdentifier(path) {
        usedVariables.add(path.node.name);
      },
    });

    // Removes unused variables
    declaredVariables.forEach((path, name) => {
      if (!usedVariables.has(name) && !path.removed) {
        path.remove();
        removed.push(name);
        isRemovalPerformed = true;
      }
    });

    // Continues looping until no more removals are performed
    // Only if deep check is enabled
  } while (deepCheck && isRemovalPerformed);

  return removed;
}

export function findImports(content: string, variableNames: string[]) {
  const ast = parseFile(content, ["jsx"]);

  const found: string[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      path.node.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportSpecifier") {
          if (variableNames.includes(specifier.local.name)) {
            found.push(specifier.local.name);
          }
        } else if (
          specifier.type === "ImportDefaultSpecifier" ||
          specifier.type === "ImportNamespaceSpecifier"
        ) {
          if (variableNames.includes("default")) {
            found.push("default");
          }
        }
      });
    },
  });

  return found;
}
