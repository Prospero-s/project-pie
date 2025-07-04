import * as Sentry from "@sentry/react";
const dsn = import.meta.env.VITE_SENTRY_DSN;
console.log(dsn);
Sentry.init({
  dsn: dsn,

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  integrations: [
  ],

});
