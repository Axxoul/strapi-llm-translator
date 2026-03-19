"use strict";
const react = require("react");
const jsxRuntime = require("react/jsx-runtime");
const styledComponents = require("styled-components");
const reactIntl = require("react-intl");
const icons = require("@strapi/icons");
const designSystem = require("@strapi/design-system");
const admin = require("@strapi/strapi/admin");
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const PLUGIN_ID = "strapi-llm-translator";
const Initializer = ({ setPlugin }) => {
  const ref = react.useRef(setPlugin);
  react.useEffect(() => {
    ref.current(PLUGIN_ID);
  }, []);
  return null;
};
const PluginIcon = ({
  fill: fillProp = "currentColor",
  stroke: strokeProp,
  ...props
}) => {
  const { colors } = styledComponents.useTheme();
  const fill = String(
    fillProp && fillProp in colors ? colors[fillProp] : fillProp
  );
  const stroke = strokeProp && strokeProp in colors ? String(colors[strokeProp]) : strokeProp ? String(strokeProp) : void 0;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "32",
      height: "32",
      viewBox: "0 0 32 32",
      fill,
      stroke,
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M28.414 9.171L22.829 3.585C22.6433 3.3992 22.4228 3.25181 22.1801 3.15125C21.9373 3.05069 21.6772 2.99893 21.4145 2.99893C21.1518 2.99893 20.8917 3.05069 20.6489 3.15125C20.4062 3.25181 20.1857 3.3992 20 3.585L4.586 19C4.39938 19.185 4.25145 19.4053 4.15084 19.6481C4.05023 19.8909 3.99896 20.1512 4 20.414V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H11.586C11.8488 28.001 12.1091 27.9498 12.3519 27.8492C12.5947 27.7486 12.815 27.6006 13 27.414L28.414 12C28.5998 11.8143 28.7472 11.5938 28.8478 11.3511C28.9483 11.1084 29.0001 10.8482 29.0001 10.5855C29.0001 10.3228 28.9483 10.0627 28.8478 9.81995C28.7472 9.57725 28.5998 9.35673 28.414 9.171ZM24 13.585L18.414 8L21.414 5L27 10.585L24 13.585Z",
            fill: "currentColor"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M4 12H2C1.73478 12 1.48043 11.8946 1.29289 11.7071C1.10536 11.5196 1 11.2652 1 11C1 10.7348 1.10536 10.4804 1.29289 10.2929C1.48043 10.1054 1.73478 10 2 10H4V8C4 7.73478 4.10536 7.48043 4.29289 7.29289C4.48043 7.10536 4.73478 7 5 7C5.26522 7 5.51957 7.10536 5.70711 7.29289C5.89464 7.48043 6 7.73478 6 8V10H8C8.26522 10 8.51957 10.1054 8.70711 10.2929C8.89464 10.4804 9 10.7348 9 11C9 11.2652 8.89464 11.5196 8.70711 11.7071C8.51957 11.8946 8.26522 12 8 12H6V14C6 14.2652 5.89464 14.5196 5.70711 14.7071C5.51957 14.8946 5.26522 15 5 15C4.73478 15 4.48043 14.8946 4.29289 14.7071C4.10536 14.5196 4 14.2652 4 14V12Z",
            fill: "currentColor"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M9 2H10C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3C11 3.26522 10.8946 3.51957 10.7071 3.70711C10.5196 3.89464 10.2652 4 10 4H9V5C9 5.26522 8.89464 5.51957 8.70711 5.70711C8.51957 5.89464 8.26522 6 8 6C7.73478 6 7.48043 5.89464 7.29289 5.70711C7.10536 5.51957 7 5.26522 7 5V4H6C5.73478 4 5.48043 3.89464 5.29289 3.70711C5.10536 3.51957 5 3.26522 5 3C5 2.73478 5.10536 2.48043 5.29289 2.29289C5.48043 2.10536 5.73478 2 6 2H7V1C7 0.734784 7.10536 0.48043 7.29289 0.292893C7.48043 0.105357 7.73478 0 8 0C8.26522 0 8.51957 0.105357 8.70711 0.292893C8.89464 0.48043 9 0.734784 9 1V2Z",
            fill: "currentColor"
          }
        )
      ]
    }
  );
};
const getLocaleFromUrl = () => {
  try {
    const params = new URL(window.location.href).searchParams;
    return params.get("plugins[i18n][locale]") || "en";
  } catch {
    return "en";
  }
};
const getTranslation = (id) => `${PLUGIN_ID}.${id}`;
const LLMButton = () => {
  const [loading, setIsLoading] = react.useState(false);
  const [success, setSuccess] = react.useState(false);
  const [error, setError] = react.useState(false);
  const { formatMessage } = reactIntl.useIntl();
  const { form, contentType, components } = admin.unstable_useContentManagerContext();
  const { post } = admin.useFetchClient();
  const { toggleNotification } = admin.useNotification();
  const isI18nEnabled = contentType?.pluginOptions?.i18n?.localized || false;
  const { values, onChange } = form;
  if (!isI18nEnabled) {
    return null;
  }
  const currentLocale = getLocaleFromUrl();
  const getButtonState = () => {
    if (loading) {
      return {
        variant: "secondary",
        icon: icons.Magic,
        loading: true,
        disabled: true,
        tooltip: formatMessage({
          id: getTranslation("button.tooltip.loading"),
          defaultMessage: "Content is being translated"
        }),
        title: formatMessage({
          id: getTranslation("button.label.loading"),
          defaultMessage: "Translating content..."
        })
      };
    }
    if (success) {
      return {
        variant: "success",
        icon: icons.CheckCircle,
        loading: false,
        disabled: true,
        tooltip: formatMessage({
          id: getTranslation("button.tooltip.success"),
          defaultMessage: "Content has been translated successfully"
        }),
        title: formatMessage({
          id: getTranslation("button.label.success"),
          defaultMessage: "Translation completed"
        })
      };
    }
    if (error) {
      return {
        variant: "danger",
        icon: icons.WarningCircle,
        loading: false,
        disabled: false,
        tooltip: formatMessage({
          id: getTranslation("button.tooltip.error"),
          defaultMessage: "Translation failed. Click to try again"
        }),
        title: formatMessage({
          id: getTranslation("button.label.error"),
          defaultMessage: "Translation failed"
        })
      };
    }
    return {
      variant: "secondary",
      icon: icons.Magic,
      loading: false,
      disabled: false,
      tooltip: formatMessage({
        id: getTranslation("button.tooltip.idle"),
        defaultMessage: "Translate content using AI"
      }),
      title: formatMessage({
        id: getTranslation("button.label.idle"),
        defaultMessage: "Translate with AI"
      })
    };
  };
  const resetState = () => {
    setSuccess(false);
    setError(false);
    setIsLoading(false);
  };
  const handleLLMRequest = async () => {
    try {
      resetState();
      setIsLoading(true);
      const dataToSend = {
        contentType,
        fields: values,
        components,
        targetLanguage: currentLocale
      };
      const { data: response } = await post(`/${PLUGIN_ID}/generate`, {
        ...dataToSend
      });
      if (!response.meta.ok) {
        throw new Error(response.meta.message);
      }
      if (response.data) {
        Object.entries(response.data).forEach(([key, value]) => {
          if (values[key] !== void 0) {
            onChange({ target: { name: key, value } });
          }
        });
        setSuccess(true);
        toggleNotification({
          type: "success",
          message: formatMessage({
            id: getTranslation("notification.success"),
            defaultMessage: "Translation completed successfully"
          })
        });
      }
    } catch (error2) {
      setError(true);
      toggleNotification({
        type: "danger",
        message: formatMessage(
          {
            id: `${getTranslation("notification.error")}: ${error2}`,
            defaultMessage: `Error during translation: ${error2}`
          },
          { error: error2.message }
        )
      });
    } finally {
      setIsLoading(false);
    }
  };
  const buttonState = getButtonState();
  return /* @__PURE__ */ jsxRuntime.jsx(
    designSystem.Button,
    {
      variant: buttonState.variant,
      startIcon: /* @__PURE__ */ jsxRuntime.jsx(buttonState.icon, {}),
      fullWidth: true,
      loading: buttonState.loading,
      onClick: handleLLMRequest,
      disabled: !isI18nEnabled || buttonState.disabled,
      title: buttonState.tooltip,
      children: buttonState.title
    }
  );
};
const index = {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID
      },
      Component: async () => {
        const { App } = await Promise.resolve().then(() => require("./App-COSMdnpL.js"));
        return App;
      }
    });
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID
    });
  },
  bootstrap(app) {
    app.getPlugin("content-manager").injectComponent("editView", "right-links", {
      name: "llm-assistant-button",
      Component: LLMButton
    });
  },
  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./translations/de.json": () => Promise.resolve().then(() => require("./de-CvAR4QXO.js")), "./translations/en.json": () => Promise.resolve().then(() => require("./en-BjVvIBv8.js")) }), `./translations/${locale}.json`, 3);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  }
};
exports.PLUGIN_ID = PLUGIN_ID;
exports.PluginIcon = PluginIcon;
exports.getTranslation = getTranslation;
exports.index = index;
