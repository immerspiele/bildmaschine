import config from './config.mjs';
import server from './server.mjs';
import bootstrap from './bootstrap.mjs';

(async () => {
  await bootstrap();
  server.listen(config.port, config.host, () => {
    console.log(`Server running at http://${config.host}:${config.port}/`);
  });
})();
