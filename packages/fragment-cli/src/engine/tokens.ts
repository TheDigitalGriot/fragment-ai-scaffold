export type TokenMap = Record<string, string>;

export function replaceTokens(content: string, tokens: TokenMap): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return key in tokens ? tokens[key] : match;
  });
}

export function buildTokenMap(projectName: string, authorName: string): TokenMap {
  return {
    PROJECT_NAME: projectName,
    PACKAGE_SCOPE: `@${projectName}`,
    AUTHOR_NAME: authorName,
    YEAR: new Date().getFullYear().toString(),
  };
}
