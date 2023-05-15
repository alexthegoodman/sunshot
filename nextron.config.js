const path = require("path");
const cwd = process.cwd();
const externals = require(path.join(cwd, "package.json")).dependencies;

module.exports = {
  // specify an alternate main src directory, defaults to 'main'
  mainSrcDir: "main",
  // specify an alternate renderer src directory, defaults to 'renderer'
  rendererSrcDir: "renderer",

  // main process' webpack config
  webpack: (config, env) => {
    // do some stuff here
    config.externals = [...Object.keys(externals || {}), "sunshot-recorder"];
    // config.main.prod.externals = ["sunshot-recorder"];
    return config;
  },
};
