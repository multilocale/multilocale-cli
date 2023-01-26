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

// src/downloadCommand.js
var downloadCommand_exports = {};
__export(downloadCommand_exports, {
  default: () => downloadCommand_default
});
module.exports = __toCommonJS(downloadCommand_exports);
var import_commander = __toESM(require("commander"));
var import_fs_extra4 = __toESM(require("fs-extra"));
var import_path5 = __toESM(require("path"));
var import_getTranslatables = __toESM(require("@multilocale/multilocale-js-client/getTranslatables.js"));

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

// src/getAndroidResPath.js
var import_path3 = __toESM(require("path"));

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

// src/getAndroidManifest.js
function getAndroidManifest() {
  let files = getFiles();
  files = files.filter((file) => !file.includes("/build/"));
  files = files.filter((file) => file.endsWith("AndroidManifest.xml"));
  return files[0];
}

// src/getAndroidResPath.js
function getAndroidResPath() {
  let androidManifestPath = getAndroidManifest();
  let resPath = import_path3.default.resolve(
    androidManifestPath.replace("AndroidManifest.xml", "res")
  );
  if (resPath.startsWith("/")) {
    resPath = resPath.slice(1);
  }
  return resPath;
}

// src/getProject.js
var import_getProject = __toESM(require("@multilocale/multilocale-js-client/getProject.js"));
var import_getProjects = __toESM(require("@multilocale/multilocale-js-client/getProjects.js"));

// src/getConfig.js
var import_fs_extra2 = __toESM(require("fs-extra"));

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
var import_path4 = __toESM(require("path"));
function setConfig(config) {
  let configPath = import_path4.default.resolve(".", "multilocale.json");
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

// src/isAndroid.js
function isAndroid() {
  return !!getAndroidManifest();
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

// src/downloadCommand.js
function sortObject(o) {
  return Object.keys(o).sort().reduce((r, k) => {
    r[k] = o[k];
    return r;
  }, {});
}
function downloadCommand() {
  const command = new import_commander.default.Command("download");
  command.option("--project [project]", "project id or name");
  command.action(async (options) => {
    try {
      console.log("download");
      rehydrateSession();
      if (!isLoggedInSession()) {
        await login();
      }
      let project = await getProject(options == null ? void 0 : options.project);
      let translatables = await (0, import_getTranslatables.default)({
        project: project.name
      });
      console.log(`Found ${(translatables == null ? void 0 : translatables.length) ?? 0} translatables`);
      if (isAndroid()) {
        console.log("Android project detected");
        let androidResPath = getAndroidResPath();
        let language2key2value = translatables.reduce(
          (language2key2value2, translatable) => {
            if (!language2key2value2[translatable.language]) {
              language2key2value2[translatable.language] = {
                locale: translatable.language
              };
            }
            language2key2value2[translatable.language][translatable.key] = translatable.value;
            return language2key2value2;
          },
          {}
        );
        let languages = Object.keys(language2key2value).sort();
        console.log(`Found ${(languages == null ? void 0 : languages.length) ?? 0} languages`);
        for (let l = 0; l < languages.length; l += 1) {
          let language = languages[l];
          let key2value = sortObject(language2key2value[language]);
          let keys = Object.keys(key2value);
          const stringsXml = `/* DO NOT EDIT MANUALLY */
/* Edit at https://app.multilocale.com/projects/${project._id} */
/* Download translation files with https://github.com/multilocale/multilocale-cli */
<?xml version="1.0" encoding="utf-8"?>
<resources>
` + keys.reduce((string, key) => {
            let value = key2value[key] || "";
            string += `<string name="${key}">${value}</string>
`;
            return string;
          }, "") + "</resources>\n";
          let folderPath = language === "en" ? import_path5.default.resolve(androidResPath, "values") : import_path5.default.resolve(androidResPath, `values-${language}`);
          if (!import_fs_extra4.default.existsSync(folderPath)) {
            import_fs_extra4.default.mkdirSync(folderPath);
          }
          let stringsXmlPath = import_path5.default.resolve(folderPath, "strings.xml");
          let stringXmlPretty = stringsXml;
          import_fs_extra4.default.writeFileSync(stringsXmlPath, stringXmlPretty);
          console.log(
            `${language}: ${stringsXmlPath.replace(import_path5.default.resolve("."), "")}`
          );
        }
      } else {
        let language2key2value = translatables.reduce(
          (language2key2value2, translatable) => {
            if (!language2key2value2[translatable.language]) {
              language2key2value2[translatable.language] = {
                locale: translatable.language
              };
            }
            language2key2value2[translatable.language][translatable.key] = translatable.value;
            return language2key2value2;
          },
          {}
        );
        let { locales, paths } = project;
        if (!paths) {
          paths = ["translations/%lang%.json"];
        }
        paths.forEach((path_) => {
          if (path_.includes("%lang%")) {
            locales.forEach((language) => {
              let phrasesJsonPath = import_path5.default.resolve(path_.replace("%lang%", language));
              let key2value = sortObject(language2key2value[language]);
              import_fs_extra4.default.mkdirSync(import_path5.default.dirname(phrasesJsonPath), { recursive: true });
              import_fs_extra4.default.writeFileSync(
                phrasesJsonPath,
                JSON.stringify(key2value, null, 2) + "\n"
              );
              console.log(
                `${language}: ${phrasesJsonPath.replace(import_path5.default.resolve("."), "")}`
              );
            });
          } else {
            console.log(`Path ${path_} does not include %lang%`);
          }
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  });
  return command;
}
var downloadCommand_default = downloadCommand;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
