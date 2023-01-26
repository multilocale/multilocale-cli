var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/logoutCommand.js
var logoutCommand_exports = {};
__export(logoutCommand_exports, {
  default: () => logoutCommand_default
});
module.exports = __toCommonJS(logoutCommand_exports);
var import_commander = __toESM(require("commander"));

// src/session/clearSession.js
var import_accessToken = require("@multilocale/multilocale-js-client/accessToken.js");
var import_refreshToken = require("@multilocale/multilocale-js-client/refreshToken.js");

// src/session/localStorage.js
var import_os = __toESM(require("os"));
var import_path = __toESM(require("path"));
var import_node_localstorage = require("node-localstorage");
var localStorage;
if (!localStorage) {
  const homeDir = import_os.default.homedir();
  localStorage = new import_node_localstorage.LocalStorage(import_path.default.resolve(homeDir, ".multilocale"));
}
var localStorage_default = localStorage;

// src/session/clearSession.js
function clearSession() {
  localStorage_default.clear();
  (0, import_accessToken.setAccessTokenCallbackForMultilocaleClient)(null);
  (0, import_accessToken.setAccessTokenForMultilocaleClient)(null);
  (0, import_refreshToken.setRefreshTokenForMultilocaleClient)(null);
}

// src/logoutCommand.js
function logoutCommand() {
  const command = new import_commander.default.Command("logout");
  command.action(async () => {
    try {
      console.log("logout");
      clearSession();
      console.log("logged out");
    } catch (error) {
      console.log("error", error);
    }
  });
  return command;
}
var logoutCommand_default = logoutCommand;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
