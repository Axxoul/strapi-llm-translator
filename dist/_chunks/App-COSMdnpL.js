"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const admin = require("@strapi/strapi/admin");
const reactRouterDom = require("react-router-dom");
const designSystem = require("@strapi/design-system");
const reactIntl = require("react-intl");
const react = require("react");
const index = require("./index-DuLkx3CK.js");
const DEFAULT_SYSTEM_PROMPT = "You are a professional translator. Your task is to translate the provided content accurately while preserving the original meaning and tone.";
const DEFAULT_LLM_TEMPERATURE = 0.3;
const MAX_LLM_TEMPERATURE = 2;
const MIN_LLM_TEMPERATURE = 0.1;
const HomePage = () => {
  const [config, setConfig] = react.useState({ systemPrompt: "", temperature: 0.3 });
  const { formatMessage } = reactIntl.useIntl();
  const { get, post } = admin.useFetchClient();
  react.useEffect(() => {
    const fetchData = async () => {
      const response = await get(`/${index.PLUGIN_ID}/config`);
      setConfig({ ...config, ...response.data });
    };
    fetchData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    await post(`/${index.PLUGIN_ID}/config`, { ...config });
  };
  const handleRestore = async () => {
    setConfig({ systemPrompt: DEFAULT_SYSTEM_PROMPT, temperature: DEFAULT_LLM_TEMPERATURE });
    await post(`/${index.PLUGIN_ID}/config`, {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      temperature: DEFAULT_LLM_TEMPERATURE
    });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Main, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      designSystem.Box,
      {
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 8,
        paddingTop: 8,
        "data-strapi-header": true,
        background: "neutral100",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { "data-strapi-header": true, alignItems: "center", gap: 3, marginBottom: 4, children: [
            /* @__PURE__ */ jsxRuntime.jsx(index.PluginIcon, { width: 42, height: 42 }),
            " ",
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "alpha", tag: "h1", fontWeight: "bold", children: formatMessage({
              id: index.getTranslation("plugin.page.title"),
              defaultMessage: "LLM Translator (Configuration)"
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "delta", textColor: "neutral600", fontWeight: "normal", children: formatMessage({
            id: index.getTranslation("plugin.page.description"),
            defaultMessage: "Configure the LLM Translator plugin settings. Be aware that Base Model, API Key and LLM Base URL need to be set as environment variables."
          }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingLeft: 10, paddingRight: 10, children: /* @__PURE__ */ jsxRuntime.jsx(
      designSystem.Box,
      {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
        background: "neutral0",
        children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            designSystem.Field.Root,
            {
              id: "system_prompt",
              hint: formatMessage({
                id: index.getTranslation("plugin.page.form.system_prompt_hint"),
                defaultMessage: "This is (part) of the prompt that will be used to instruct the LLM. It should be clear and concise."
              }),
              required: true,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Label, { children: formatMessage({
                  id: index.getTranslation("plugin.page.form.system_prompt"),
                  defaultMessage: "System prompt"
                }) }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  designSystem.Textarea,
                  {
                    id: "system_prompt",
                    value: config.systemPrompt,
                    onChange: (e) => setConfig({ ...config, systemPrompt: e.target.value }),
                    required: true,
                    placeholder: DEFAULT_SYSTEM_PROMPT,
                    name: "system_prompt"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Error, {}),
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Hint, {})
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { gap: 4, marginTop: 6, flex: 1, children: [
            /* @__PURE__ */ jsxRuntime.jsxs(
              designSystem.Field.Root,
              {
                id: "llm_temperature",
                hint: formatMessage({
                  id: index.getTranslation("plugin.page.form.llm_temperature_hint"),
                  defaultMessage: "Temperature setting for the LLM. A higher value will make the output more random, while a lower value will make it more focused and deterministic."
                }),
                flex: 1,
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Label, { children: formatMessage({
                    id: index.getTranslation("plugin.page.form.llm_temperature"),
                    defaultMessage: "LLM Temperature"
                  }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    designSystem.NumberInput,
                    {
                      id: "llm_temperature",
                      value: config.temperature,
                      name: "llm_temperature",
                      step: 0.1,
                      min: MIN_LLM_TEMPERATURE,
                      max: MAX_LLM_TEMPERATURE,
                      onValueChange: (value) => {
                        let tempValue = DEFAULT_LLM_TEMPERATURE;
                        if (value === void 0) {
                          tempValue = DEFAULT_LLM_TEMPERATURE;
                        } else if (value < MIN_LLM_TEMPERATURE) {
                          tempValue = MIN_LLM_TEMPERATURE;
                        } else if (value > MAX_LLM_TEMPERATURE) {
                          tempValue = MAX_LLM_TEMPERATURE;
                        } else {
                          tempValue = value;
                        }
                        setConfig({ ...config, temperature: tempValue });
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Error, {}),
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Hint, {})
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(
              designSystem.Field.Root,
              {
                id: "llm_model",
                flex: 1,
                hint: formatMessage({
                  id: index.getTranslation("plugin.page.form.llm_model_hint"),
                  defaultMessage: "Model that will be used to generate the translations. It should be set as an environment variable."
                }),
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Label, { children: formatMessage({
                    id: index.getTranslation("plugin.page.form.llm_model"),
                    defaultMessage: "LLM Model"
                  }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    designSystem.TextInput,
                    {
                      id: "llm_model",
                      value: process.env.STRAPI_ADMIN_LLM_TRANSLATOR_LLM_MODEL,
                      disabled: true,
                      name: "llm_model"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Error, {}),
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Hint, {})
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(
              designSystem.Field.Root,
              {
                id: "llm_base_url",
                flex: 1,
                hint: formatMessage({
                  id: index.getTranslation("plugin.page.form.llm_base_url_hint"),
                  defaultMessage: "Base URL for the LLM API. It needs to be set as an environment variable."
                }),
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Label, { children: formatMessage({
                    id: index.getTranslation("plugin.page.form.llm_base_url"),
                    defaultMessage: "LLM Base Url"
                  }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    designSystem.TextInput,
                    {
                      id: "llm_base_url",
                      value: process.env.STRAPI_ADMIN_LLM_TRANSLATOR_LLM_BASE_URL,
                      disabled: true,
                      name: "llm_base_url"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Error, {}),
                  /* @__PURE__ */ jsxRuntime.jsx(designSystem.Field.Hint, {})
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { gap: 2, marginTop: 6, justifyContent: "flex-end", children: [
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Button, { variant: "secondary", type: "button", onClick: handleRestore, marginTop: 4, children: formatMessage({
              id: index.getTranslation("plugin.page.form.restore"),
              defaultMessage: "Restore to default"
            }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Button, { variant: "default", type: "submit", marginTop: 4, children: formatMessage({
              id: index.getTranslation("plugin.page.form.save"),
              defaultMessage: "Save"
            }) })
          ] })
        ] })
      }
    ) })
  ] });
};
const App = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(reactRouterDom.Routes, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { index: true, element: /* @__PURE__ */ jsxRuntime.jsx(HomePage, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { path: "*", element: /* @__PURE__ */ jsxRuntime.jsx(admin.Page.Error, {}) })
  ] });
};
exports.App = App;
