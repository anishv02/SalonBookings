const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withGradleMetadataFix(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("packagingOptions")) return config;

    config.modResults.contents = config.modResults.contents.replace(
      /android {/,
      `android {
    packagingOptions {
        exclude "META-INF/*.kotlin_module"
        exclude "META-INF/DEPENDENCIES"
        exclude "META-INF/LICENSE"
        exclude "META-INF/LICENSE.txt"
        exclude "META-INF/license.txt"
        exclude "META-INF/NOTICE"
        exclude "META-INF/NOTICE.txt"
        exclude "META-INF/notice.txt"
    }`
    );

    return config;
  });
};
