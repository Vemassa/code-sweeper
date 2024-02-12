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

export function parseVariableDeclaration(content: string): Array<string> {
  const ast = parseFile(content, ["jsx"]);

  const variableDeclarations: string[] = [];
  traverse(ast, {
    VariableDeclaration({ node }) {
      if (node.declarations) {
        node.declarations.forEach((declaration) => {
          if (declaration.id.type === "Identifier") {
            variableDeclarations.push(declaration.id.name);
          }
        });
      }
    },
  });

  return variableDeclarations;
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
