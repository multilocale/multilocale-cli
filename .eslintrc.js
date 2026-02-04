/* Copyright 2013 - 2024 Waiterio LLC */
module.exports = {
  rules: {
    // @multilocale/multilocale-js-client is intentionally in devDependencies
    // because it gets bundled during the build step for npm publishing
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
  },
}
