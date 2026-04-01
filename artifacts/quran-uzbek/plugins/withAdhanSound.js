/**
 * Custom Expo config plugin that copies adhan.mp3 directly into
 * android/app/src/main/res/raw/ — the only place Android checks for
 * notification channel sounds.
 *
 * This runs automatically during every EAS build (expo prebuild phase).
 */
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withAdhanSound = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const rawDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "raw"
      );

      // Ensure res/raw/ exists
      if (!fs.existsSync(rawDir)) {
        fs.mkdirSync(rawDir, { recursive: true });
      }

      const src = path.join(
        config.modRequest.projectRoot,
        "assets",
        "sounds",
        "adhan.mp3"
      );
      const dest = path.join(rawDir, "adhan.mp3");

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(
          "[withAdhanSound] ✓ adhan.mp3 → android/app/src/main/res/raw/adhan.mp3"
        );
      } else {
        console.warn(
          "[withAdhanSound] ⚠ adhan.mp3 not found at assets/sounds/adhan.mp3"
        );
      }

      return config;
    },
  ]);
};

module.exports = withAdhanSound;
