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

// src/importCommand.js
var importCommand_exports = {};
__export(importCommand_exports, {
  default: () => importCommand_default
});
module.exports = __toCommonJS(importCommand_exports);
var import_fs_extra4 = __toESM(require("fs-extra"));
var import_path5 = __toESM(require("path"));
var import_commander = __toESM(require("commander"));
var import_xml2json = require("xml2json");
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

// src/isAndroid.js
function isAndroid() {
  return !!getAndroidManifest();
}

// src/isGatsby.js
function getAndroidManifest2() {
  let files = getFiles();
  files = files.filter((file) => file.endsWith("gatsby-config.js"));
  return files.length > 0;
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

// src/importCommand.js
function importCommand() {
  const command = new import_commander.default.Command("import");
  command.option("--project [project]", "project id or name");
  command.action(async (options) => {
    console.log("import into multilocale.com");
    rehydrateSession();
    if (!isLoggedInSession()) {
      await login();
    }
    let project = await getProject(options == null ? void 0 : options.project);
    let defaultLocale = project.defaultLocale || "en";
    if (isAndroid()) {
      console.log("Android project detected");
      let files = getFiles();
      files = files.filter((file) => file.endsWith("strings.xml"));
      console.log(`Found ${files.length} languages`);
      let translatables = [];
      for (let f = 0; f < files.length; f += 1) {
        let file = files[f];
        let language = defaultLocale;
        if (file.includes("/values-")) {
          language = file.split("/values-")[1].split("/")[0];
        }
        let androidResPath = getAndroidResPath();
        let stringsXmlPath = import_path5.default.resolve(androidResPath, "values/strings.xml");
        let stringsXml = import_fs_extra4.default.readFileSync(stringsXmlPath, "utf8");
        let stringsJson = JSON.parse((0, import_xml2json.toJson)(stringsXml));
        let translatablesForLanguage = stringsJson.resources.string.map(
          ({ name, $t }) => ({
            _id: (0, import_uuid.default)(),
            key: name,
            value: $t,
            language,
            creationTime: new Date().toISOString(),
            lastEditTime: new Date().toISOString(),
            googleTranslate: false,
            imported: true,
            organizationId: project.organizationId,
            projects: [project.name]
          })
        );
        console.log(
          `${language}: Found ${translatablesForLanguage.length} translatables`
        );
        translatables = translatables.concat(translatablesForLanguage);
      }
      await (0, import_addTranslatables.default)(translatables);
      console.log(
        `Added ${translatables.length} translatables: https://app.multilocale.com/projects/${project._id}`
      );
    } else if (getAndroidManifest2()) {
      console.log("Gatsby project detected");
      let files = getFiles();
      const { locales, paths } = project;
      console.log({ locales, paths });
      const locale2files = {};
      paths.forEach((path_) => {
        if (path_.includes("%lang%")) {
          locales.forEach((locale) => {
            const suffix = path_.replace("%lang%", locale);
            const matchingFiles = files.filter((file) => file.endsWith(suffix));
            if (matchingFiles.length === 0) {
              console.log(
                `No matching files for path ${path_} and locale ${locale}`
              );
            } else {
              if (!locale2files[locale]) {
                locale2files[locale] = [];
              }
              if (matchingFiles.length === 1) {
                locale2files[locale].push(matchingFiles[0]);
              } else if (matchingFiles.length > 1) {
                console.log(
                  `Found multiple matching files for path ${path_} and locale ${locale}:`
                );
                matchingFiles.forEach((matchingFile) => {
                  console.log(`  ${matchingFile}`);
                  locale2files[locale].push(matchingFile);
                });
              }
            }
          });
        } else {
          console.log(`Path ${path_} does not include %lang%`);
        }
      });
      const localesFound = Object.keys(locale2files);
      const filesFound = Object.values(locale2files).flat();
      if (filesFound.length > 0) {
        console.log(
          `Found ${filesFound.length} files in ${localesFound.length} locales:`
        );
        filesFound.forEach((fileFound) => console.log(`  ${fileFound}`));
        let key2locale2translatable = {};
        for (let l = 0; l < localesFound.length; l += 1) {
          let locale = localesFound[l];
          let files2 = locale2files[locale];
          for (let f = 0; f < files2.length; f += 1) {
            let file = files2[f];
            if (file.startsWith("/")) {
              file = file.substring(1);
            }
            let filePath = import_path5.default.resolve(file);
            let fileString = import_fs_extra4.default.readFileSync(filePath, "utf8");
            let extension = import_path5.default.extname(file);
            let json;
            if (extension === ".json") {
              json = JSON.parse(fileString);
            } else if (!extension === ".json") {
              throw new Error(
                `It was not possible to detect the extension of ${file}`
              );
            } else {
              throw new Error(
                `Unsupported file extension ${extension} for file ${file}`
              );
            }
            let keys2 = Object.keys(json);
            const language = locale;
            let translatablesForLanguage = 0;
            keys2.forEach((key) => {
              if (!key2locale2translatable[key]) {
                key2locale2translatable[key] = {};
              }
              let translatable = {
                _id: (0, import_uuid.default)(),
                key,
                value: json[key],
                language,
                creationTime: new Date().toISOString(),
                lastEditTime: new Date().toISOString(),
                googleTranslate: false,
                imported: true,
                organizationId: project.organizationId,
                projects: [project.name],
                projectsIds: [project._id]
              };
              key2locale2translatable[key][locale] = translatable;
              translatablesForLanguage += 1;
            });
            console.log(
              `${language}: Found ${translatablesForLanguage} translatables`
            );
          }
        }
        let keys = Object.keys(key2locale2translatable);
        for (let k = 0; k < keys.length; k += 1) {
          let key = keys[k];
          let locales2 = Object.keys(key2locale2translatable[key]);
          if (locales2.length === 0) {
            throw new Error(`key ${key} has no locales`);
          }
          let from = defaultLocale;
          if (!key2locale2translatable[key][defaultLocale]) {
            from = locales2[0];
          }
          for (let l = 0; l < project.locales.length; l += 1) {
            let to = project.locales[l];
            if (!locales2.includes(to)) {
              let translatableFrom = key2locale2translatable[key][from];
              let string = translatableFrom.value;
              let { translation } = await (0, import_translateString.default)({ string, to, from });
              let translatableTo = {
                _id: (0, import_uuid.default)(),
                key,
                value: translation,
                language: to,
                creationTime: new Date().toISOString(),
                lastEditTime: new Date().toISOString(),
                googleTranslate: true,
                organizationId: project.organizationId,
                projects: [project.name],
                projectsIds: [project._id]
              };
              console.log(`${to}: translated key ${key} to ${translation}`);
              key2locale2translatable[key][to] = translatableTo;
            }
          }
        }
        let translatables2 = Object.keys(key2locale2translatable).reduce(
          (translatables3, key) => {
            return translatables3.concat(
              Object.values(key2locale2translatable[key])
            );
          },
          []
        );
        await (0, import_addTranslatables.default)(translatables2);
        console.log(
          `Added ${translatables2.length} translatables: https://app.multilocale.com/projects/${project._id}`
        );
      } else {
        console.log("Could not find any file matching paths in project");
      }
      let translatables = [];
    } else {
      console.log("Could not detect project type");
    }
  });
  return command;
}
var importCommand_default = importCommand;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
