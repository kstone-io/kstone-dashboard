import en_US from "./locales/en-US/en-US.json";
import zh_CN from "./locales/zh-CN/zh-CN.json";
const defaultLocale = "en-US";

const supportedLocales = {
  "en-US": {
    translation: en_US,
  },
  "zh-CN": {
    translation: zh_CN,
  },
};

export { defaultLocale, supportedLocales };
