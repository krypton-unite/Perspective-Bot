pkg_name = require('./package.json').name

module.exports = {
  apps : [{
    name: pkg_name,
    script: "./dist/"+pkg_name+".js",
    // instances: "max",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}