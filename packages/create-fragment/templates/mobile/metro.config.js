const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so packages/core + packages/ui are live source.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Map the workspace scope aliases to package SOURCE, and rewrite the ".js"
// specifiers the shared packages use (NodeNext style) back to their .ts/.tsx.
const aliases = {
  "{{PACKAGE_SCOPE}}/core": path.resolve(workspaceRoot, "packages/core/src"),
  "{{PACKAGE_SCOPE}}/ui": path.resolve(workspaceRoot, "packages/ui/src"),
};
const base = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  let name = moduleName;
  for (const [prefix, target] of Object.entries(aliases)) {
    if (name === prefix || name.startsWith(prefix + "/")) {
      name = target + name.slice(prefix.length);
      break;
    }
  }
  if (name.endsWith(".js") && name.includes(`${path.sep}packages${path.sep}`)) {
    for (const ext of [".ts", ".tsx"]) {
      const candidate = name.replace(/\.js$/, ext);
      if (fs.existsSync(candidate)) {
        name = candidate;
        break;
      }
    }
  }
  return (base ?? context.resolveRequest)(context, name, platform);
};

module.exports = config;
