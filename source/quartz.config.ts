import { QuartzConfig } from "./quartz/cfg"
import { ValidLocale } from "./quartz/i18n"
import { Theme } from "./quartz/util/theme"

import * as Plugin from "./quartz/plugins"
import * as AppConfig from "./app.config.json"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: AppConfig.pageTitle,
    pageTitleSuffix: AppConfig.pageTitleSuffix,
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: AppConfig.locale as ValidLocale,
    baseUrl: AppConfig.baseUrl,
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: AppConfig.theme.fontOrigin as Theme["fontOrigin"],
      cdnCaching: true,
      typography: {
        header: AppConfig.theme.typography.header,
        body: AppConfig.theme.typography.body,
        code: AppConfig.theme.typography.code,
      },
      colors: {
        lightMode: {
          light: AppConfig.theme.colors.lightMode.light,
          lightgray: AppConfig.theme.colors.lightMode.lightgray,
          gray: AppConfig.theme.colors.lightMode.gray,
          darkgray: AppConfig.theme.colors.lightMode.darkgray,
          dark: AppConfig.theme.colors.lightMode.dark,
          secondary: AppConfig.theme.colors.lightMode.secondary,
          tertiary: AppConfig.theme.colors.lightMode.tertiary,
          highlight: AppConfig.theme.colors.lightMode.highlight,
          textHighlight: AppConfig.theme.colors.lightMode.textHighlight,
        },
        darkMode: {
          light: AppConfig.theme.colors.darkMode.light,
          lightgray: AppConfig.theme.colors.darkMode.lightgray,
          gray: AppConfig.theme.colors.darkMode.gray,
          darkgray: AppConfig.theme.colors.darkMode.darkgray,
          dark: AppConfig.theme.colors.darkMode.dark,
          secondary: AppConfig.theme.colors.darkMode.secondary,
          tertiary: AppConfig.theme.colors.darkMode.tertiary,
          highlight: AppConfig.theme.colors.darkMode.highlight,
          textHighlight: AppConfig.theme.colors.darkMode.textHighlight,
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
