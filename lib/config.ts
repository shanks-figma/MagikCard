export const AppConfig = {
  name: "SaaS Template",
  locales: [
    {
      id: "en",
      name: "English",
    },
    { id: "fr", name: "Français" },
  ],
  defaultLocale: "en",
};

export const AllLocales = AppConfig.locales.map((locale) => locale.id);
