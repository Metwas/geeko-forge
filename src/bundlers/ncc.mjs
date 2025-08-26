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

import { writeFile, mkdirSync, existsSync, statSync } from "node:fs";
import { clean } from "../tools/file.mjs";
import { join, resolve } from "node:path";
import ncc from '@vercel/ncc';

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @private
 * @type {String}
 */
const INDEX_404_ERROR = "Unable to locate main executable, defaults to main.ts OR index.ts. Please specify index file with the [-i,--index] flag";

/**
 * Invokes the @see ncc bundler API to create a single minified .js executable
 * 
 * @public
 * @param {String} app 
 * @param {Object} options 
 * @param {Function} log
 * @returns {Promise<Boolean>}
 */
export const build = async (app, options, log) =>
{
       try
       {
              let executablePath = options.main;
              let indexFile = options.index;

              if (!indexFile && statSync(options.main).isFile() === false)
              {
                     executablePath = resolve(options.main, "main.ts");

                     if (existsSync(executablePath) === false)
                     {
                            executablePath = resolve(options.main, "index.ts");

                            if (existsSync(executablePath) === false)
                            {
                                   return {
                                          error: INDEX_404_ERROR
                                   };
                            }
                     }
              }
              else if (indexFile)
              {
                     executablePath = resolve(options.main, indexFile);

                     if (existsSync(executablePath) === false)
                     {
                            return {
                                   error: INDEX_404_ERROR
                            };
                     }
              }

              const result = await ncc(executablePath, {
                     filterAssetBase: process.cwd(),
                     assetBuilds: false,
                     target: 'es6',
                     minify: true,
                     quiet: true,
              });

              if (typeof result?.code === "string")
              {
                     const destination = options.output;
                     const code = result.code;

                     const name = `${app}.js`;

                     /** Remove any existing code */
                     clean(destination);
                     mkdirSync(destination, { recursive: true });

                     const create = () =>
                     {
                            return new Promise((resolve, reject) =>
                            {
                                   writeFile(join(destination, name), code, async (error) =>
                                   {
                                          resolve(error ? { error: error } : true);
                                   });
                            });
                     };

                     return await create();
              }

              return false;
       }
       catch (error)
       {
              return {
                     error: error.message
              };
       }
};