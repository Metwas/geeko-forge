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

/**
 * Gets the current @see Date in a short time format
 *
 * @public
 * @returns {String}
 */
export const getTimeString = function () {
       const now = new Date();
       const hours = ("0" + now.getHours()).slice(-2);
       const minutes = ("0" + now.getMinutes()).slice(-2);
       const seconds = ("0" + now.getSeconds()).slice(-2);

       return `${hours}:${minutes}:${seconds}`;
};

/**
 * Promise based sleep utility
 *
 * @public
 * @param {Number} delay
 * @returns {Promise<any>}
 */
export const sleep = (delay) => {
       return new Promise((resolve, _) => setTimeout(resolve, delay));
};
