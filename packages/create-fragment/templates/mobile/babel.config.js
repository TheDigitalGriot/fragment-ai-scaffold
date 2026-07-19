module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "{{PACKAGE_SCOPE}}/core": "../../packages/core/src",
            "{{PACKAGE_SCOPE}}/ui": "../../packages/ui/src",
          },
        },
      ],
    ],
  };
};
