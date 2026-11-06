const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;                              // mobile/sment
const workspaceRoot = path.resolve(projectRoot, "../..");   // root proyek

const config = getDefaultConfig(projectRoot);

// Izinkan Metro membaca folder convex/ dan node_modules di root
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;