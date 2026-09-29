const path = require('path');
const tsconfigPaths = require('tsconfig-paths');

const compiledSource = path.join(__dirname, 'dist', 'src');

tsconfigPaths.register({
  baseUrl: compiledSource,
  paths: {
    '@config/*': ['config/*'],
    '@controllers/*': ['controllers/*'],
    '@services/*': ['services/*'],
    '@routes/*': ['routes/*'],
    '@middlewares/*': ['middlewares/*'],
    '@repositories/*': ['repositories/*'],
    '@utils/*': ['utils/*'],
    '@validators/*': ['validators/*'],
    '@constants/*': ['constants/*'],
    '@helpers/*': ['helpers/*'],
    '@exceptions/*': ['exceptions/*'],
    '@sockets/*': ['sockets/*'],
    '@types/*': ['types/*'],
    '@logger/*': ['logger/*'],
    '@events/*': ['events/*'],
    '@jobs/*': ['jobs/*'],
    '@cache/*': ['cache/*'],
  },
});

require('./dist/src/server.js');
