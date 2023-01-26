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

// src/addCommand.js
var addCommand_exports = {};
__export(addCommand_exports, {
  default: () => addCommand_default
});
module.exports = __toCommonJS(addCommand_exports);
var import_commander = __toESM(require("commander"));
var import_addTranslatables = __toESM(require("@multilocale/multilocale-js-client/addTranslatables.js"));
var import_translateString = __toESM(require("@multilocale/multilocale-js-client/translateString.js"));
var import_uuid = __toESM(require("@multilocale/multilocale-js-client/uuid.js"));

// src/session/rehydrateSession.js
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

// src/session/getAccessToken.js
function getAccessToken() {
  return localStorage_default.getItem("accessToken");
}

// src/session/getRefreshToken.js
function getRefreshToken() {
  return localStorage_default.getItem("refreshToken");
}

// src/session/setAccessToken.js
function setAccessToken(accessToken) {
  return localStorage_default.setItem("accessToken", accessToken);
}

// src/session/rehydrateSession.js
async function rehydrateSession() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  (0, import_accessToken.setAccessTokenForMultilocaleClient)(accessToken);
  (0, import_refreshToken.setRefreshTokenForMultilocaleClient)(refreshToken);
  (0, import_accessToken.setAccessTokenCallbackForMultilocaleClient)(setAccessToken);
}

// src/session/isLoggedInSession.js
var import_refreshToken3 = require("@multilocale/multilocale-js-client/refreshToken.js");

// src/session/clearSession.js
var import_accessToken2 = require("@multilocale/multilocale-js-client/accessToken.js");
var import_refreshToken2 = require("@multilocale/multilocale-js-client/refreshToken.js");
function clearSession() {
  localStorage_default.clear();
  (0, import_accessToken2.setAccessTokenCallbackForMultilocaleClient)(null);
  (0, import_accessToken2.setAccessTokenForMultilocaleClient)(null);
  (0, import_refreshToken2.setRefreshTokenForMultilocaleClient)(null);
}

// src/session/isLoggedInSession.js
function isLoggedInSession() {
  let isLoggedIn = false;
  if (!(0, import_refreshToken3.isRefreshTokenExpired)()) {
    isLoggedIn = true;
  }
  if (!isLoggedIn) {
    clearSession();
  }
  return isLoggedIn;
}

// src/getProject.js
var import_getProject = __toESM(require("@multilocale/multilocale-js-client/getProject.js"));
var import_getProjects = __toESM(require("@multilocale/multilocale-js-client/getProjects.js"));

// src/getConfig.js
var import_fs_extra2 = __toESM(require("fs-extra"));

// src/getFiles.js
var import_fs_extra = __toESM(require("fs-extra"));
var import_path2 = __toESM(require("path"));
function getFiles_(dir) {
  const subdirs = import_fs_extra.default.readdirSync(dir);
  const files = subdirs.map((subdir) => {
    const resource = import_path2.default.resolve(dir, subdir);
    return import_fs_extra.default.statSync(resource).isDirectory() ? getFiles(resource) : resource;
  });
  return files.reduce((a, f) => a.concat(f), []);
}
function getFiles(dir) {
  dir = dir || ".";
  let files = getFiles_(dir);
  files = files.map((file) => file.replace(import_path2.default.resolve("."), "")).filter((file) => !file.startsWith("/."));
  return files;
}

// src/getConfigPath.js
function getConfigPath() {
  let configPath;
  let files = getFiles();
  files = files.filter((file) => !file.includes("/build/"));
  files = files.filter((file) => file.endsWith("multilocale.json"));
  if (files.length > 0) {
    configPath = files[0];
    if (configPath.startsWith("/")) {
      configPath = configPath.slice(1);
    }
  }
  return configPath;
}

// src/getConfig.js
function getConfig() {
  let config;
  let configPath = getConfigPath();
  if (configPath) {
    config = import_fs_extra2.default.readFileSync(configPath, "utf8");
    if (config) {
      config = JSON.parse(config);
    }
  }
  return config;
}

// src/setConfig.js
var import_fs_extra3 = __toESM(require("fs-extra"));
var import_path3 = __toESM(require("path"));
function setConfig(config) {
  let configPath = import_path3.default.resolve(".", "multilocale.json");
  let string = "";
  if (config) {
    string = JSON.stringify(config);
  }
  config = import_fs_extra3.default.writeFileSync(configPath, string);
  return config;
}

// src/getProject.js
async function getProject(projectIdOrName) {
  let project;
  let config = getConfig();
  if (!projectIdOrName) {
    projectIdOrName = config == null ? void 0 : config.projectId;
  }
  if (!projectIdOrName) {
    let projects = await (0, import_getProjects.default)();
    if (projects.length === 0) {
      throw new Error(
        "There are no projects. Create one first at https://app.multilocale.com/projects/new"
      );
    } else if (projects.length === 1) {
      projectIdOrName = projects[0]._id;
      project = projects[0];
    } else {
      let choices = projects.map((project2) => ({
        name: project2.name,
        value: project2._id
      })).sort((a, b) => a.name.localeCompare(b.name));
      let inquirer = await import("inquirer");
      let answers = await inquirer.prompt([
        {
          type: "list",
          name: "projectId",
          message: "Which project?",
          choices
        }
      ]);
      projectIdOrName = answers.projectId;
      project = projects.find((project2) => project2._id === projectIdOrName);
    }
    if (project && !config) {
      setConfig({
        organizationId: project.organizationId,
        projectId: project._id
      });
      console.log("created multilocale.json with default projectId");
    }
  }
  if (!project && projectIdOrName) {
    project = await (0, import_getProject.default)(projectIdOrName);
  }
  return project;
}

// src/login.js
var import_login = __toESM(require("@multilocale/multilocale-js-client/login.js"));

// src/session/storeNewSession.js
var import_accessToken3 = require("@multilocale/multilocale-js-client/accessToken.js");
var import_refreshToken4 = require("@multilocale/multilocale-js-client/refreshToken.js");

// src/session/setRefreshToken.js
function setRefreshToken(refreshToken) {
  return localStorage_default.setItem("refreshToken", refreshToken);
}

// src/session/storeNewSession.js
async function storeNewSession({ accessToken, refreshToken }) {
  try {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    (0, import_accessToken3.setAccessTokenForMultilocaleClient)(accessToken, setAccessToken);
    (0, import_refreshToken4.setRefreshTokenForMultilocaleClient)(refreshToken, setRefreshToken);
    (0, import_accessToken3.setAccessTokenCallbackForMultilocaleClient)(setAccessToken);
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

// src/addCommand.js
function addCommand() {
  const command = new import_commander.default.Command("add");
  command.argument("<key>", "key of string");
  command.argument(
    "[value]",
    "value of string. If not provided, will be equal to key."
  );
  command.option("--project [project]", "project id or name");
  command.action(async (key, value, options) => {
    console.log("add string");
    if (!value) {
      value = value || key;
      console.log("value not provided, using key as value");
    }
    rehydrateSession();
    if (!isLoggedInSession()) {
      await login();
    }
    let project = await getProject(options == null ? void 0 : options.project);
    let language = project.defaultLocale || "en";
    let translatables = [];
    let translatableOriginal = {
      _id: (0, import_uuid.default)(),
      key,
      value,
      language,
      creationTime: new Date().toISOString(),
      lastEditTime: new Date().toISOString(),
      googleTranslate: false,
      organizationId: project.organizationId,
      projects: [project.name],
      projectsIds: [project._id]
    };
    translatables.push(translatableOriginal);
    console.log(`${language}: ${value}`);
    for (let i = 0; i < project.locales.length; i += 1) {
      let locale = project.locales[i];
      if (locale !== language) {
        let string = translatableOriginal.value;
        let to = locale;
        let from = translatableOriginal.language;
        let { translation } = await (0, import_translateString.default)({
          string,
          to,
          from
        });
        let translatable = {
          ...translatableOriginal,
          _id: (0, import_uuid.default)(),
          language: locale,
          googleTranslate: true,
          value: translation
        };
        translatables.push(translatable);
        console.log(`${locale}: ${translation}`);
      }
    }
    await (0, import_addTranslatables.default)(translatables);
    console.log(
      `Added ${translatables.length} phrases: https://app.multilocale.com/projects/${project._id}`
    );
  });
  return command;
}
var addCommand_default = addCommand;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
