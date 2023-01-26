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

// src/login.js
var login_exports = {};
__export(login_exports, {
  default: () => login
});
module.exports = __toCommonJS(login_exports);
var import_login = __toESM(require("@multilocale/multilocale-js-client/login.js"));

// src/session/storeNewSession.js
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

// src/session/setAccessToken.js
function setAccessToken(accessToken) {
  return localStorage_default.setItem("accessToken", accessToken);
}

// src/session/setRefreshToken.js
function setRefreshToken(refreshToken) {
  return localStorage_default.setItem("refreshToken", refreshToken);
}

// src/session/storeNewSession.js
async function storeNewSession({ accessToken, refreshToken }) {
  try {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    (0, import_accessToken.setAccessTokenForMultilocaleClient)(accessToken, setAccessToken);
    (0, import_refreshToken.setRefreshTokenForMultilocaleClient)(refreshToken, setRefreshToken);
    (0, import_accessToken.setAccessTokenCallbackForMultilocaleClient)(setAccessToken);
    return true;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
}

// src/login.js
async function login(email, password) {
  let inquirer = await import("inquirer");
  let answers = await inquirer.prompt([
    {
      name: "email",
      when: !email
    },
    {
      type: "password",
      name: "password",
      when: !password
    }
  ]);
  email = email || answers.email;
  password = password || answers.password;
  let { accessToken, refreshToken } = await (0, import_login.default)(email, password).catch(
    console.error
  );
  storeNewSession({ accessToken, refreshToken });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
