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
import * as vite from "vite";

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

              const builder = await vite.build({
                     build: {
                            minify: true,
                            sourcemap: false,
                            emptyOutDir: true,
                            logLevel: "silent",
                            outDir: options["output"],
                            target: "esnext",
                            lib: {
                                   entry: executablePath,
                                   formats: ["iife"],
                                   fileName: app,
                                   name: app,
                            },
                            rollupOptions: {
                                   output: {
                                          inlineDynamicImports: true,
                                   },
                            },
                     },
                     customLogger: {
                            info: () => {},
                            error: () => {},
                            warn: () => {},
                     },
              });

              return true;
       } catch (error) {
              return {
                     error: error,
              };
       }
};
