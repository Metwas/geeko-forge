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

import { exec } from "node:child_process";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Typescript transpiler command-line
 *
 * @public
 * @type {String}
 */
const TSC_COMMAND = "tsc";

/**
 * Invokes the @see nestjs bundler. This works only for node-based applications.
 *
 * @public
 * @param {String} app
 * @param {Object} options
 * @returns {Promise<Boolean>}
 */
export const build = async (app, options) => {
       try {
              const build = () => {
                     return new Promise((resolve, _) => {
                            const process = exec(
                                   TSC_COMMAND,
                                   (error, stdout, stderr) => {
                                          const hasError = error ?? stderr;
                                          // resolve stdout error message, otherwise return true if succesful
                                          resolve(
                                                 hasError
                                                        ? {
                                                                 error:
                                                                        hasError +
                                                                        "\n" +
                                                                        stdout,
                                                          }
                                                        : true,
                                          );
                                   },
                            );

                            process.on("error", (error) => {
                                   resolve({ error: error });
                            });
                     });
              };

              return await build();
       } catch (error) {
              return {
                     error: error.message,
              };
       }
};
