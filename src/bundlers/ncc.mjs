/**
 * Copyright (c) Metwas
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/**_-_-_-_-_-_-_-_-_-_-_-_-_- Imports  _-_-_-_-_-_-_-_-_-_-_-_-_-*/

import { getEntryFile } from "../tools/file.mjs";
import { writeFile, mkdirSync } from "node:fs";
import { clean } from "../tools/file.mjs";
import { join } from "node:path";
import ncc from "@vercel/ncc";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Invokes the @see ncc bundler API to create a single minified .js executable
 *
 * @public
 * @param {String} app
 * @param {Object} options
 * @param {Function} log
 * @returns {Promise<Boolean>}
 */
export const build = async (app, options, log) => {
       try {
              const executablePath = getEntryFile(options);

              if (executablePath?.error) {
                     return executablePath;
              }

              const result = await ncc(executablePath, {
                     filterAssetBase: process.cwd(),
                     assetBuilds: false,
                     target: "es2020",
                     minify: true,
                     quiet: true,
              });

              if (typeof result?.code === "string") {
                     const destination = options.output;
                     const code = result.code;

                     const name = `${app}.js`;

                     /** Remove any existing code */
                     clean(destination);
                     mkdirSync(destination, { recursive: true });

                     const create = () => {
                            return new Promise((resolve, reject) => {
                                   writeFile(
                                          join(destination, name),
                                          code,
                                          async (error) => {
                                                 resolve(
                                                        error
                                                               ? {
                                                                        error: error,
                                                                 }
                                                               : true,
                                                 );
                                          },
                                   );
                            });
                     };

                     return await create();
              }

              return false;
       } catch (error) {
              return {
                     error: error.message,
              };
       }
};
