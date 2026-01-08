import { Page, APIResponse } from '@playwright/test';
import { env } from '../config/env.js';

export type ApiCapture = {
  url: string;
  status: number;
  ok: boolean;
  requestMethod: string;
  requestPostData?: string | null;
  responsePreview?: string;
};

export const waitForDiscoveryResponse = async (page: Page, contains: string[], timeout = env.waitForAPI) => {
  const matcher = (resp: APIResponse) => {
    const url = resp.url();
    return contains.some((token) => url.includes(token));
  };
  try {
    const response = await page.waitForResponse(matcher, { timeout });
    return captureResponse(response);
  } catch (err) {
    return {
      url: 'timeout',
      status: 200,
      ok: false,
      requestMethod: 'GET',
      requestPostData: undefined,
      responsePreview: String(err),
    };
  }
};

export const captureResponse = async (response: APIResponse): Promise<ApiCapture> => {
  let preview: string | undefined;
  try {
    const text = await response.text();
    preview = text.slice(0, 1000);
  } catch (err) {
    preview = String(err);
  }
  return {
    url: response.url(),
    status: response.status(),
    ok: response.ok(),
    requestMethod: response.request().method(),
    requestPostData: response.request().postData(),
    responsePreview: preview,
  };
};
