import { useIntl } from 'react-intl';
import { CheckCircle, Magic, WarningCircle } from '@strapi/icons';
import { Button } from '@strapi/design-system';
import {
  unstable_useContentManagerContext as useContentManagerContext,
  useNotification,
} from '@strapi/strapi/admin';
import { useState } from 'react';

import {
  ExtendedContentType,
  Form,
  LLMGenerateRequestBody,
  TranslationResponse,
  TranslatorButtonState,
} from 'custom';
import { getLocaleFromUrl } from '../utils/getLocaleFromUrl';
import { getTranslation } from '../utils/getTranslation';
import { PLUGIN_ID } from '../../src/pluginId';

const LLMButton = () => {
  const [loading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const { formatMessage } = useIntl();
  const { form, contentType, components } = useContentManagerContext();

  const { toggleNotification } = useNotification();

  const isI18nEnabled =
    (contentType as ExtendedContentType)?.pluginOptions?.i18n?.localized || false;
  const { values, onChange } = form as Form;

  if (!isI18nEnabled) {
    return null;
  }

  const currentLocale = getLocaleFromUrl();

  // Button state: loading, success, error, idle
  const getButtonState = (): TranslatorButtonState => {
    if (loading) {
      return {
        variant: 'secondary',
        icon: Magic,
        loading: true,
        disabled: true,
        tooltip: formatMessage({
          id: getTranslation('button.tooltip.loading'),
          defaultMessage: 'Content is being translated',
        }),
        title: formatMessage({
          id: getTranslation('button.label.loading'),
          defaultMessage: 'Translating content...',
        }),
      };
    }
    if (success) {
      return {
        variant: 'success',
        icon: CheckCircle,
        loading: false,
        disabled: true,
        tooltip: formatMessage({
          id: getTranslation('button.tooltip.success'),
          defaultMessage: 'Content has been translated successfully',
        }),
        title: formatMessage({
          id: getTranslation('button.label.success'),
          defaultMessage: 'Translation completed',
        }),
      };
    }
    if (error) {
      return {
        variant: 'danger',
        icon: WarningCircle,
        loading: false,
        disabled: false,
        tooltip: formatMessage({
          id: getTranslation('button.tooltip.error'),
          defaultMessage: 'Translation failed. Click to try again',
        }),
        title: formatMessage({
          id: getTranslation('button.label.error'),
          defaultMessage: 'Translation failed',
        }),
      };
    }
    return {
      variant: 'secondary',
      icon: Magic,
      loading: false,
      disabled: false,
      tooltip: formatMessage({
        id: getTranslation('button.tooltip.idle'),
        defaultMessage: 'Translate content using AI',
      }),
      title: formatMessage({
        id: getTranslation('button.label.idle'),
        defaultMessage: 'Translate with AI',
      }),
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

      const dataToSend: LLMGenerateRequestBody = {
        contentType,
        fields: values,
        components,
        targetLanguage: currentLocale,
      };

      const token = JSON.parse(localStorage.getItem('jwtToken') || 'null');
      const url = `${window.strapi.backendURL}/${PLUGIN_ID}/generate`;

      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(dataToSend),
      });

      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}`);
      }

      const reader = fetchResponse.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }

      // Parse SSE: find the last "data: " line (ignore heartbeat comments)
      let response: TranslationResponse | null = null;
      for (const line of buffer.split('\n')) {
        if (line.startsWith('data: ')) {
          response = JSON.parse(line.slice(6));
        }
      }

      if (!response) {
        throw new Error('No data received from server');
      }

      if (!response.meta.ok) {
        throw new Error(response.meta.message);
      }

      // Update the form with translated content
      if (response.data) {
        Object.entries(response.data).forEach(([key, value]) => {
          if (values[key] !== undefined) {
            onChange({ target: { name: key, value } });
          }
        });
        setSuccess(true);
        toggleNotification({
          type: 'success',
          message: formatMessage({
            id: getTranslation('notification.success'),
            defaultMessage: 'Translation completed successfully',
          }),
        });
      }
    } catch (error) {
      setError(true);
      toggleNotification({
        type: 'danger',
        message: formatMessage(
          {
            id: `${getTranslation('notification.error')}: ${error}`,
            defaultMessage: `Error during translation: ${error}`,
          },
          { error: (error as Error).message }
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonState = getButtonState();

  return (
    <Button
      variant={buttonState.variant}
      startIcon={<buttonState.icon />}
      fullWidth
      loading={buttonState.loading}
      onClick={handleLLMRequest}
      disabled={!isI18nEnabled || buttonState.disabled}
      title={buttonState.tooltip}
    >
      {buttonState.title}
    </Button>
  );
};

export default LLMButton;
