const { execFileSync } = require("node:child_process");

const requiredPackages = [
  "lightningcss-linux-x64-gnu@1.32.0",
  "@tailwindcss/oxide-linux-x64-gnu@4.3.0",
];

function canResolve(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

function packageNameFromSpec(spec) {
  const versionSeparator = spec.lastIndexOf("@");
  return spec.slice(0, versionSeparator);
}

if (process.platform !== "linux" || process.arch !== "x64") {
  process.exit(0);
}

const missingPackages = requiredPackages
  .map(packageNameFromSpec)
  .filter((packageName) => !canResolve(packageName));

if (missingPackages.length === 0) {
  process.exit(0);
}

console.log(`Installing missing native CSS packages: ${missingPackages.join(", ")}`);

execFileSync(
  "npm",
  ["install", "--no-save", "--package-lock=false", "--include=optional", ...requiredPackages],
  { stdio: "inherit" },
);
