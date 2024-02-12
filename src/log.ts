export const styled = (color: string, message: string) =>
  `\x1b[${color}m${message}\x1b[0m`;

export const warning = (message: string) => styled("33", message);
export const error = (message: string) => styled("31", message);
export const success = (message: string) => styled("32", message);
export const underline = (message: string) => styled("4", message);
