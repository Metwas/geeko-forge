/**
     MIT License

     @Copyright (c) Metwas

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above Copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR Copyright HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
*/

/**_-_-_-_-_-_-_-_-_-_-_-_-_- @Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

import { getTimeString, sleep } from "../tools/time.mjs";
import { error, ok, usage } from "../tools/cli.mjs";
import * as file from "../tools/file.mjs";
import * as esbuild from "./esbuild.mjs";
import { resolve } from "node:path";
import * as vite from "./vite.mjs";
import * as tsc from "./tsc.mjs";
import * as ncc from "./ncc.mjs";
import chalk from "chalk";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Application builder & bundler script
 * 
 * @param {String} app
 * @param {Array<string>} flags
 * @param {Function} log
 * @returns {Promise<string>} 
 */
export const build = async function (flags, log)
{
       const app = flags[ "n" ] ?? "app";

       const skipCompile = flags[ "c" ] ?? flags[ "skip-compile" ] ?? false;
       const skipBundle = flags[ "b" ] ?? flags[ "skip-bundle" ] ?? false;

       const help = flags[ "h" ] ?? flags[ "help" ];

       if (help)
       {
              log(`${chalk.yellowBright("\n" + usage)}`, false);
              return false;
       }

       const type = flags[ "t" ] ?? flags[ "target" ];

       if (!type)
       {
              log(`${chalk.yellowBright("Missing builder target\n" + usage)}`, false);
              return false;
       }

       const assets = `${flags[ "a" ] ?? flags[ "assets" ] ?? resolve(process.cwd(), "./assets")}`;
       const environment = flags[ "e" ] ?? flags[ "env" ] ?? "production";
       const output = `${flags[ "o" ] ?? flags[ "out" ] ?? "dist"}`;
       const verbose = flags[ "v" ] ?? flags[ "verbose" ];
       const index = flags[ "i" ] ?? flags[ "index" ];
       const strip = flags[ "strip-comments" ];

       let sourceDirectory = "./src";
       let tmpDirectory = "./tmp";

       const rootDirectory = process.cwd();

       let directory = resolve(rootDirectory, output);
       let main = resolve(rootDirectory, sourceDirectory);

       if (strip)
       {
              try
              {
                     /** Strip comments */
                     await file.copy({
                            destination: resolve(rootDirectory, tmpDirectory),
                            stripComments: true,
                            debug: verbose,
                            path: main
                     }, log);

                     main = main.replace(sourceDirectory.replace("./", ""), tmpDirectory.replace("./", ""));
              }
              catch (error)
              {
                     log(`${chalk.yellowBright("Failed to strip comments, continuing to specified bundler")}`, false);
              }
       }

       let success = skipCompile;

       if (!skipCompile)
       {
              const header = chalk.cyanBright(`Building ${app} @ ${chalk.yellowBright(getTimeString())}`);
              log(header);

              const options = {
                     environment: environment,
                     output: directory,
                     verbose: verbose,
                     assets: assets,
                     index: index,
                     main: main
              };

              switch (type)
              {
                     case "ncc":
                            success = await ncc.build(app, options, log);
                            break;
                     case "esbuild":
                            success = await esbuild.build(app, options, log);
                            break;
                     case "tsc":
                            success = await tsc.build(app, options, log);
                            break;
                     case "vite":
                            success = await vite.build(app, options, log);
                            break;
                     default:
                            if (!type)
                            {
                                   // if empty, use tsc
                                   success = await tsc.build(app, options, log);
                            }
                            else
                            {
                                   // specified builder not found
                                   log(chalk.yellowBright(`Specified builder [${type}] not found`), false);
                                   return false;
                            }
              };

              let statusText = "";

              if (success?.[ "error" ] || !success)
              {
                     const message = typeof success?.[ "error" ] === "string" ? success[ "error" ] : (success?.[ "error" ]?.[ "message" ] || `Failed to build using ${type}`);
                     statusText = error(verbose && message);
              }
              else
              {
                     statusText = ok();
              }

              log(`${header}\t${statusText}`, false);
              log(false);

              await sleep(50);
       }

       if (!skipBundle && success === true)
       {
              const bundlingHeader = chalk.cyanBright(`Bundling ${app} @ ${chalk.yellowBright(getTimeString())}`);

              /** Copy over any resources/assets for the given @see app */
              const success = await file.bundleAssets({
                     environment: environment,
                     destination: directory,
                     verbose: verbose,
                     app: app
              });

              let statusText = "";

              if (success?.[ "error" ] || !success)
              {
                     const message = typeof success?.[ "error" ] === "string" ? success[ "error" ] : (success?.[ "error" ]?.[ "message" ] || `Failed to bundle using ${type}`);
                     statusText = error(verbose && message);
              }
              else
              {
                     statusText = ok();
              }

              log(`${bundlingHeader}\t${statusText}`, false);
              log(false);
              await sleep(100);
       }

       return success?.[ "error" ] ? false : true;
};