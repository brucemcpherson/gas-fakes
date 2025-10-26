/**
 * @fileoverview a logger that can be silenced by an env variable
 * used for all internal gas-fakes logging
 */

export const isQuiet =  process.env.QUIET.toString().toLowerCase()=== "true";

export const cliLogger = {
  log: isQuiet ? () => {} : console.log,
  error: console.error,
  warn: console.warn,
  info: isQuiet ? () => {} : console.info
};