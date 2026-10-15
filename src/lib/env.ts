const isProduction = import.meta.env.VITE_ENVIRONMENT === "production";

export const env = {
  geoapifyApiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
  backendUrl: isProduction
    ? import.meta.env.VITE_BACKEND_URL_PROD
    : import.meta.env.VITE_BACKEND_URL_DEV,
};
