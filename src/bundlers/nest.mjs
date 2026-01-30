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
                     const command = "nest";

                     return new Promise((resolve, reject) => {
                            const process = exec(
                                   `${command} build ${app}`,
                                   (error, stdout, stderr) => {
                                          if (error) {
                                                 return reject(error);
                                          }
                                   },
                            );

                            process.on("error", (error) => {
                                   reject(error);
                            });

                            process.on("close", () => {
                                   resolve(true);
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
