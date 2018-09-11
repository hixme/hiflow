import yargs from "yargs";

const { argv } = yargs;

export const {
  _,
  verbose: VERBOSE2,
  v: VERBOSE1,
  create,
  smart,
  status,
  ...args
} = argv;

export const VERBOSE = VERBOSE1 || VERBOSE2;

const [cliCommand = "help", actionType] = _;

export const command = cliCommand;

export const action = actionType;

export const HOME = require("os").homedir();
