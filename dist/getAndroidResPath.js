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

// src/getAndroidResPath.js
var getAndroidResPath_exports = {};
__export(getAndroidResPath_exports, {
  default: () => getAndroidResPath
});
module.exports = __toCommonJS(getAndroidResPath_exports);
var import_path2 = __toESM(require("path"));

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
  let resPath = import_path2.default.resolve(
    androidManifestPath.replace("AndroidManifest.xml", "res")
  );
  if (resPath.startsWith("/")) {
    resPath = resPath.slice(1);
  }
  return resPath;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
