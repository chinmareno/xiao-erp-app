import enResource from "./en";
import zhResource from "./zh";
import idResource from "./id";

const localeResources = { en: enResource, zh: zhResource, id: idResource };

export default localeResources;

export type Locale = typeof enResource;
