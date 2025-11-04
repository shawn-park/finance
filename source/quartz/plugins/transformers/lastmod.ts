import fs from "fs"
import path from "path"
import { Repository } from "@napi-rs/simple-git"
import { QuartzTransformerPlugin } from "../types"
import chalk from "chalk"

export interface Options {
  priority: ("frontmatter" | "git" | "filesystem")[]
}

const defaultOptions: Options = {
  priority: ["frontmatter", "git", "filesystem"],
}

function isValidDate(d: any): boolean {
  if (d instanceof Date) return false;

  if (isNaN(d.getTime()) || d.getTime() === 0) return false;

  return true;
}

function coerceDate(fp: string, d: any): Date {
  const dt = new Date(d);

  if (!isValidDate(dt)) {
    /*console.log(
      chalk.yellow(
        `\nWarning: found invalid date "${d}" in \`${fp}\`.\nSupported formats: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format`,
      ),
    )*/
    return new Date();
  }

  return dt;
}

type MaybeDate = undefined | string | number
export const CreatedModifiedDate: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "CreatedModifiedDate",
    markdownPlugins() {
      return [
        () => {
          let repo: Repository | undefined = undefined
          return async (_tree, file) => {
            let created: MaybeDate = undefined
            let modified: MaybeDate = undefined
            let published: MaybeDate = undefined

            const fp = file.data.filePath!
            const fullFp = path.isAbsolute(fp) ? fp : path.posix.join(file.cwd, fp)
            for (const source of opts.priority) {
              if (source === "filesystem") {
                const st = await fs.promises.stat(fullFp)
                created ||= st.birthtimeMs
                modified ||= st.mtimeMs
              } else if (source === "frontmatter" && file.data.frontmatter) {
                created ||= file.data.frontmatter.date as MaybeDate
                modified ||= file.data.frontmatter.lastmod as MaybeDate
                modified ||= file.data.frontmatter.updated as MaybeDate
                modified ||= file.data.frontmatter["last-modified"] as MaybeDate
                published ||= file.data.frontmatter.publishDate as MaybeDate
              } else if (source === "git") {
                if (!repo) {
                  // Get a reference to the main git repo.
                  // It's either the same as the workdir,
                  // or 1+ level higher in case of a submodule/subtree setup
                  repo = Repository.discover(file.cwd)
                }

                try {
                  modified ||= await repo.getFileLatestModifiedDateAsync(file.data.filePath!)
                } catch {
                  console.log(
                    chalk.yellow(
                      `\nWarning: ${file.data
                        .filePath!} isn't yet tracked by git, last modification date is not available for this file`,
                    ),
                  )
                }
              }
            }

            file.data.dates = {
              created: coerceDate(fp, created),
              modified: coerceDate(fp, modified),
              published: coerceDate(fp, published),
            }
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    dates: {
      created: Date
      modified: Date
      published: Date
    }
  }
}
