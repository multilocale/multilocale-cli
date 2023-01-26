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

// src/getProject.js
var getProject_exports = {};
__export(getProject_exports, {
  default: () => getProject
});
module.exports = __toCommonJS(getProject_exports);
var import_getProject = __toESM(require("@multilocale/multilocale-js-client/getProject.js"));
var import_getProjects = __toESM(require("@multilocale/multilocale-js-client/getProjects.js"));

// src/getConfig.js
var import_fs_extra2 = __toESM(require("fs-extra"));

// src/getFiles.js
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));
function getFiles_(dir) {
  const subdirs = import_fs_extra.default.readdirSync(dir);
  const files = subdirs.map((subdir) => {
    const resource = import_path.default.resolve(dir, subdir);
    return import_fs_extra.default.statSync(resource).isDirectory() ? getFiles(resource) : resource;
  });
  return files.reduce((a, f) => a.concat(f), []);
}
function getFiles(dir) {
  dir = dir || ".";
  let files = getFiles_(dir);
  files = files.map((file) => file.replace(import_path.default.resolve("."), "")).filter((file) => !file.startsWith("/."));
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
var import_path2 = __toESM(require("path"));
function setConfig(config) {
  let configPath = import_path2.default.resolve(".", "multilocale.json");
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
