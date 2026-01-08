export type EnvironmentConfig = {
  baseURL: string;
  defaultTimeout: number;
  waitForAPI: number;
};

export const env: EnvironmentConfig = {
  baseURL: process.env.BASE_URL ?? 'https://tmdb-discover.surge.sh',
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT ?? 10_000),
  waitForAPI: Number(process.env.WAIT_FOR_API ?? 20_000),
};
