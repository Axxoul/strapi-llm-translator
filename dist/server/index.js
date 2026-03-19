"use strict";
const openai = require("openai");
const bootstrap = ({ strapi: strapi2 }) => {
};
const destroy = ({ strapi: strapi2 }) => {
};
const register = ({ strapi: strapi2 }) => {
};
const DEFAULT_SYSTEM_PROMPT = "You are a professional translator. Your task is to translate the provided content accurately while preserving the original meaning and tone.";
const SYSTEM_PROMPT_APPENDIX = `The user asks you to translate the text to a specific language, the language is provided via short code like "en", "fr", "de", etc.`;
const DEFAULT_LLM_TEMPERATURE = 0.3;
const DEFAULT_LLM_MODEL = "gpt-4o";
const DEFAULT_LLM_BASE_URL = "https://api.openai.com/v1";
const SYSTEM_PROMPT_FIX = `You are a JSON correction assistant. Only return valid, corrected JSON.`;
const USER_PROMPT_FIX_PREFIX = "Fix this invalid JSON and return ONLY the corrected JSON. No explanations allowed. The JSON is:";
const config = {
  default: ({ env }) => ({
    llmApiKey: env("LLM_TRANSLATOR_LLM_API_KEY"),
    llmEndpoint: env("STRAPI_ADMIN_LLM_TRANSLATOR_LLM_BASE_URL"),
    llmModel: env("STRAPI_ADMIN_LLM_TRANSLATOR_LLM_MODEL")
  }),
  validator(config2) {
    const PLUGIN_NAME = "Strapi LLM Translator";
    console.info(`
==== ${PLUGIN_NAME} Configuration Validation ====`);
    if (!config2?.llmApiKey) {
      console.warn("⚠️  LLM API Key: Missing");
      console.info("   → Translation features requiring API keys will be disabled");
    } else {
      console.info("✅ LLM API Key: Configured");
    }
    const endpoint = config2?.llmEndpoint || DEFAULT_LLM_BASE_URL;
    if (!config2?.llmEndpoint) {
      console.warn(`⚠️  API Endpoint: Using default (${DEFAULT_LLM_BASE_URL})`);
    } else {
      console.info(`✅ API Endpoint: Configured (${endpoint})`);
    }
    const model = config2?.llmModel || DEFAULT_LLM_MODEL;
    if (!config2?.llmModel) {
      console.warn(`⚠️  LLM Model: Using default (${DEFAULT_LLM_MODEL})`);
    } else {
      console.info(`✅ LLM Model: Configured (${model})`);
    }
    console.info("========================================================\n");
  }
};
const contentTypes = {};
const HEARTBEAT_INTERVAL_MS = 15e3;
const controllers$1 = ({ strapi: strapi2 }) => ({
  // Generate translations (SSE with heartbeats to avoid Heroku 30s timeout)
  async generate(ctx) {
    const res = ctx.res;
    const req = ctx.req;
    ctx.respond = false;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    });
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, HEARTBEAT_INTERVAL_MS);
    let clientDisconnected = false;
    req.on("close", () => {
      clientDisconnected = true;
      clearInterval(heartbeat);
    });
    try {
      const { fields, components, targetLanguage, contentType } = ctx.request.body;
      const result = await strapi2.plugin("strapi-llm-translator").service("llm-service").generateWithLLM(contentType, fields, components, {
        targetLanguage
      });
      clearInterval(heartbeat);
      if (!clientDisconnected) {
        res.write(`data: ${JSON.stringify(result)}

`);
        res.end();
      }
    } catch (error) {
      console.error("Error in generate controller:", error);
      clearInterval(heartbeat);
      if (!clientDisconnected) {
        res.write(
          `data: ${JSON.stringify({
            meta: { ok: false, status: 500, message: "Internal server error" }
          })}

`
        );
        res.end();
      }
    }
  },
  // Get the configuration
  async getConfig(ctx) {
    const pluginStore = strapi2.store({
      environment: strapi2.config.environment,
      type: "plugin",
      name: "strapi-llm-translator"
      // replace with your plugin name
    });
    const config2 = await pluginStore.get({ key: "configuration" });
    ctx.body = config2 || {};
  },
  // Save the configuration
  async setConfig(ctx) {
    const { body } = ctx.request;
    const pluginStore = strapi2.store({
      environment: strapi2.config.environment,
      type: "plugin",
      name: "strapi-llm-translator"
      // replace with your plugin name
    });
    await pluginStore.set({
      key: "configuration",
      value: { ...body }
    });
    ctx.body = await pluginStore.get({ key: "configuration" });
  }
});
const controllers = {
  admin: controllers$1
};
const middlewares = {};
const policies = {};
const adminRoutes = [
  {
    method: "POST",
    path: "/generate",
    handler: "admin.generate",
    config: {
      policies: []
    }
  },
  {
    method: "GET",
    path: "/config",
    handler: "admin.getConfig",
    config: {
      policies: []
    }
  },
  {
    method: "POST",
    path: "/config",
    handler: "admin.setConfig",
    config: {
      policies: []
    }
  }
];
const routes = {
  admin: {
    type: "admin",
    routes: adminRoutes
  }
};
const cleanJSONString = (content) => {
  return content.replace(/^```json\s*\n/, "").replace(/^```\s*\n/, "").replace(/\n\s*```$/, "").replace(/\u200B/g, "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').trim();
};
const balanceJSONBraces = (content) => {
  let openBraces = 0;
  let closeBraces = 0;
  let inString = false;
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (char === '"' && content[i - 1] !== "\\") {
      inString = !inString;
    }
    if (!inString) {
      if (char === "{") openBraces += 1;
      if (char === "}") closeBraces += 1;
    }
  }
  if (openBraces > closeBraces) {
    return content + "}".repeat(openBraces - closeBraces);
  }
  return content;
};
const extractJSONObject = (content) => {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1);
  }
  return content;
};
const safeJSONParse = (content) => {
  const parsed = JSON.parse(content);
  if (typeof parsed === "object" && parsed !== null) {
    return parsed;
  }
  throw new Error("Invalid response format - not an object");
};
const getEffectiveBaseUrl = (userConfig) => {
  return userConfig?.llmBaseUrl || process.env.STRAPI_ADMIN_LLM_TRANSLATOR_LLM_BASE_URL || DEFAULT_LLM_BASE_URL;
};
const getEffectiveModel = (userConfig) => {
  return userConfig?.llmModel || process.env.STRAPI_ADMIN_LLM_TRANSLATOR_LLM_MODEL || DEFAULT_LLM_MODEL;
};
const getLLMClient = (userConfig) => {
  return new openai.OpenAI({
    baseURL: getEffectiveBaseUrl(userConfig),
    apiKey: process.env.LLM_TRANSLATOR_LLM_API_KEY ?? "not_set"
  });
};
const BATCH_SIZE = 10;
const deepMerge = (target, source) => {
  const output = { ...target };
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (sourceValue instanceof Object && !Array.isArray(sourceValue) && targetValue instanceof Object && !Array.isArray(targetValue)) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  }
  return output;
};
const extractTranslatableFields = (contentType, fields, components = {}) => {
  const translatableFields = [];
  const isTranslatableFieldSchema = (schema, value) => {
    if (!schema) {
      return false;
    }
    const { type } = schema;
    const isStringType = ["string", "text"].includes(type) && typeof value === "string";
    const isRichTextType = ["richtext", "richText", "blocks"].includes(type) && (typeof value === "string" || typeof value === "object");
    const isJSONType = type === "json" && typeof value === "object";
    const isNotUID = type !== "uid";
    const isLocalizable = schema.pluginOptions?.i18n?.localized !== false;
    return (isStringType || isRichTextType || isJSONType) && isNotUID && isLocalizable;
  };
  const traverse = (schema, data, path = [], originalPath = []) => {
    Object.entries(schema.attributes || {}).forEach(([fieldName, fieldSchemaRaw]) => {
      const fieldSchema = fieldSchemaRaw;
      const value = data?.[fieldName];
      if (value === void 0 || value === null) {
        return;
      }
      if (isTranslatableFieldSchema(fieldSchema, value)) {
        translatableFields.push({
          path: [...path, fieldName],
          value,
          originalPath: [...originalPath, fieldName]
        });
        return;
      }
      if (fieldSchema.type === "component") {
        const componentSchema = components[fieldSchema.component];
        if (!componentSchema) return;
        if (fieldSchema.repeatable && Array.isArray(value)) {
          value.forEach(
            (item, index2) => traverse(
              componentSchema,
              item,
              [...path, fieldName, String(index2)],
              [...originalPath, fieldName, String(index2)]
            )
          );
        } else if (typeof value === "object") {
          traverse(componentSchema, value, [...path, fieldName], [...originalPath, fieldName]);
        }
      } else if (fieldSchema.type === "dynamiczone" && Array.isArray(value)) {
        value.forEach((item, index2) => {
          const compSchema = components[item.__component];
          if (compSchema) {
            traverse(
              compSchema,
              item,
              [...path, fieldName, String(index2)],
              [...originalPath, fieldName, String(index2)]
            );
          }
        });
      }
    });
  };
  traverse(contentType, fields, [], []);
  return translatableFields;
};
const prepareTranslationPayload = (fields) => {
  const payload = {};
  fields.forEach((field) => {
    let current = payload;
    field.path.forEach((part, index2) => {
      if (index2 === field.path.length - 1) {
        current[part] = field.value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  });
  return payload;
};
const mergeTranslatedContent = (originalData, translatedData, translatableFields) => {
  const result = JSON.parse(JSON.stringify(originalData));
  translatableFields.forEach((field) => {
    let translatedValue = translatedData;
    for (const part of field.path) {
      translatedValue = translatedValue?.[part];
      if (translatedValue === void 0) break;
    }
    if (translatedValue !== void 0) {
      let current = result;
      field.originalPath.forEach((part, index2) => {
        if (index2 === field.originalPath.length - 1) {
          current[part] = translatedValue;
        } else {
          current = current[part];
        }
      });
    }
  });
  return result;
};
const generateSlug = async (data, field, contentTypeUID) => {
  const uidService = strapi.service("plugin::content-manager.uid");
  const slug = await uidService.generateUIDField({
    contentTypeUID,
    field,
    data
  });
  return slug;
};
const findUIDFields = (contentType) => {
  const uidFields = [];
  Object.entries(contentType.attributes || {}).forEach(([fieldName, schema]) => {
    if (schema.type === "uid" && schema.targetField) {
      uidFields.push({
        fieldName,
        targetField: schema.targetField
      });
    }
  });
  return uidFields;
};
const generateUIDsForTranslatedFields = async (uidFields, translatedData, contentTypeUID, mergedContent) => {
  const translatedUIDs = {};
  for (const { fieldName, targetField } of uidFields) {
    if (translatedData[targetField] !== void 0) {
      try {
        const newUID = await generateSlug(
          {
            ...mergedContent,
            [targetField]: translatedData[targetField]
          },
          fieldName,
          contentTypeUID
        );
        translatedUIDs[fieldName] = newUID;
      } catch (error) {
        console.error(`Failed to generate UID for field ${fieldName}:`, error);
      }
    }
  }
  return translatedUIDs;
};
const llmService = ({ strapi: strapi2 }) => ({
  async generateWithLLM(contentType, fields, components, config2) {
    try {
      const userConfig = await getUserConfig();
      const translatableFields = extractTranslatableFields(contentType, fields, components);
      const batches = [];
      for (let i = 0; i < translatableFields.length; i += BATCH_SIZE) {
        batches.push(translatableFields.slice(i, i + BATCH_SIZE));
      }
      const systemPrompt = await buildSystemPrompt(userConfig);
      const translatedResults = await Promise.all(
        batches.map(async (batch) => {
          const translationPayload = prepareTranslationPayload(batch);
          const prompt = buildPrompt(translationPayload, config2.targetLanguage);
          const response = await callLLMProvider(prompt, systemPrompt, userConfig);
          return await parseLLMResponse(response, userConfig);
        })
      );
      const translatedData = translatedResults.reduce((acc, curr) => {
        return deepMerge(acc, curr);
      }, {});
      const mergedContent = mergeTranslatedContent(fields, translatedData, translatableFields);
      const uidFields = findUIDFields(contentType);
      const translatedUIDs = await generateUIDsForTranslatedFields(
        uidFields,
        translatedData,
        contentType.uid,
        mergedContent
      );
      return {
        data: {
          ...mergedContent,
          ...translatedUIDs
        },
        meta: {
          ok: true,
          status: 200,
          message: "Translation completed successfully"
        }
      };
    } catch (error) {
      strapi2.log.error("LLM translation error:", error);
      return {
        data: fields,
        // Return original fields in case of error
        meta: {
          ok: false,
          status: 500,
          message: error instanceof Error ? error.message : "Translation failed"
        }
      };
    }
  }
});
const buildPrompt = (fields, targetLanguage) => {
  return `You are translating content from a CMS. Please translate the following JSON data to ${targetLanguage}.

IMPORTANT RULES:
1. Preserve all JSON structure and keys exactly as provided
2. Only translate string values
3. Maintain any markdown formatting within the text
4. Keep HTML tags intact if present
5. Preserve any special characters or placeholders
6. Return ONLY the translated JSON object
7. Ensure the JSON is valid and well-formed. Keep arrays and nested objects intact
8. Do not add any explanations or comments
9. Ensure professional and culturally appropriate translations

SOURCE JSON:
${JSON.stringify(fields, null, 2)}`;
};
const getUserConfig = async () => {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "plugin",
    name: "strapi-llm-translator"
  });
  const config2 = await pluginStore.get({ key: "configuration" });
  return config2;
};
const buildSystemPrompt = async (userConfig) => {
  return `${userConfig?.systemPrompt || DEFAULT_SYSTEM_PROMPT} ${SYSTEM_PROMPT_APPENDIX}`;
};
const createLLMRequest = (messages, temperature = 0.1, userConfig) => {
  const client = getLLMClient(userConfig);
  return client.chat.completions.create({
    model: getEffectiveModel(userConfig),
    messages,
    temperature,
    response_format: { type: "json_object" }
  });
};
const callLLMProvider = async (prompt, systemPrompt, userConfig) => {
  return createLLMRequest(
    [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: prompt
      }
    ],
    userConfig?.temperature ?? DEFAULT_LLM_TEMPERATURE,
    userConfig
  );
};
const requestJSONCorrection = async (invalidJson, userConfig) => {
  const response = await createLLMRequest(
    [
      {
        role: "system",
        content: SYSTEM_PROMPT_FIX
      },
      {
        role: "user",
        content: `${USER_PROMPT_FIX_PREFIX} ${invalidJson}`
      }
    ],
    void 0,
    userConfig
  );
  const correctedContent = response.choices[0]?.message?.content;
  if (!correctedContent) throw new Error("No content in correction response");
  return safeJSONParse(correctedContent.trim());
};
const parseLLMResponse = async (response, userConfig) => {
  try {
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content in response");
    const cleanContent = cleanJSONString(content);
    const jsonContent = extractJSONObject(cleanContent);
    try {
      return safeJSONParse(jsonContent);
    } catch (parseError) {
      const balancedContent = balanceJSONBraces(jsonContent);
      try {
        return safeJSONParse(balancedContent);
      } catch (secondError) {
        console.error("Second parse attempt failed:", secondError);
        return await requestJSONCorrection(cleanContent, userConfig);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Translation failed: ${errorMessage}`);
  }
};
const services = {
  "llm-service": llmService
};
const index = {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares
};
module.exports = index;
