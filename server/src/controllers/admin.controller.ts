import { GenerateRequestBody, PluginUserConfig, RequestContext, StrapiContext } from 'src/types';

const HEARTBEAT_INTERVAL_MS = 15_000;

const controllers = ({ strapi }: StrapiContext) => ({
  // Generate translations (SSE with heartbeats to avoid Heroku 30s timeout)
  async generate(ctx: RequestContext & { request: { body: GenerateRequestBody } }) {
    const res = ctx.res;
    const req = ctx.req;

    // Bypass Koa's built-in response handling
    ctx.respond = false;

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send heartbeat comments every 15s to reset Heroku's idle timer
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, HEARTBEAT_INTERVAL_MS);

    // Clean up on client disconnect
    let clientDisconnected = false;
    req.on('close', () => {
      clientDisconnected = true;
      clearInterval(heartbeat);
    });

    try {
      const { fields, components, targetLanguage, contentType } = ctx.request.body;
      const result = await strapi
        .plugin('strapi-llm-translator')
        .service('llm-service')
        .generateWithLLM(contentType, fields, components, {
          targetLanguage,
        });

      clearInterval(heartbeat);
      if (!clientDisconnected) {
        res.write(`data: ${JSON.stringify(result)}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error('Error in generate controller:', error);
      clearInterval(heartbeat);
      if (!clientDisconnected) {
        res.write(
          `data: ${JSON.stringify({
            meta: { ok: false, status: 500, message: 'Internal server error' },
          })}\n\n`
        );
        res.end();
      }
    }
  },

  // Get the configuration
  async getConfig(ctx: RequestContext) {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'strapi-llm-translator', // replace with your plugin name
    });

    const config = await pluginStore.get({ key: 'configuration' });
    ctx.body = (config as PluginUserConfig) || {}; // Return empty object if no config exists yet
  },

  // Save the configuration
  async setConfig(ctx: RequestContext) {
    const { body } = ctx.request;

    // Optional: Add validation for your configuration here
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'strapi-llm-translator', // replace with your plugin name
    });

    await pluginStore.set({
      key: 'configuration',
      value: { ...body },
    });

    ctx.body = (await pluginStore.get({ key: 'configuration' })) as PluginUserConfig;
  },
});

export default controllers;
