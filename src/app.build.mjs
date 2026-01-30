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

import { getProcessArguments, logger } from "./tools/cli.mjs";
import { getTimeString } from "./tools/time.mjs";
import { build } from "./bundlers/builder.mjs";
import { ok, error } from "./tools/cli.mjs";
import minimal from "minimist";
import chalk from "chalk";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Global logger
 *
 * @public
 * @type {Function}
 */
const log = logger();

/**
 * Bundles all applications separated by ','
 *
 * @public
 * @param {Array<String>} args
 * @returns {Promise<Array>}
 */
const bundler = async function (args) {
       return await build(minimal(args), log);
};

/**
 * Begin bundling from the provided @see process arguments
 */
bundler(getProcessArguments()).then((reports) => {
       if (Array.isArray(reports) && reports.length > 0) {
              const length = reports.length;
              let index = 0;

              let status = [
                     `\n${chalk.bgBlackBright.whiteBright(`  Summary  ${chalk.yellowBright(getTimeString())}  `)}\nTotal\t${chalk.yellowBright(length)}`,
              ];

              for (; index < length; ++index) {
                     const report = reports[index];

                     const name = report["app"];
                     const state = report["status"] ? ok() : error();

                     status.push(`App ${chalk.yellowBright(name)}\t${state}`);
              }

              log(chalk.greenBright(`${status.join("\n")}`), false);
       }
});
