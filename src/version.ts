// Appens version (package.json via Vites define) – uden at hente hele ændringsloggen (ui/changelogData.ts, ~230 KB)
// i moduler, som forsiden bruger. tests/changelog.test.ts sikrer, at ændringsloggens nyeste version er den samme.
export const APP_VERSION: string = __APP_VERSION__;
