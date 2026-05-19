import * as fileStore from "./backend-core.mjs";
import * as mysqlStore from "./mysql-store.mjs";

const selectStore = async () => {
  if (mysqlStore.isMysqlConfigured()) {
    await mysqlStore.ensureMysqlReady();
    return mysqlStore;
  }
  return fileStore;
};

export const backendPaths = fileStore.backendPaths;

export const executeQuery = async (...args) => (await selectStore()).executeQuery(...args);
export const getSessionForToken = async (...args) => (await selectStore()).getSessionForToken(...args);
export const signInWithPassword = async (...args) => (await selectStore()).signInWithPassword(...args);
export const signUp = async (...args) => (await selectStore()).signUp(...args);
export const signOut = async (...args) => (await selectStore()).signOut(...args);
export const setSession = async (...args) => (await selectStore()).setSession(...args);
export const invokeFunction = async (...args) => (await selectStore()).invokeFunction(...args);
export const uploadFile = async (...args) => fileStore.uploadFile(...args);
export const getUploadFile = (...args) => fileStore.getUploadFile(...args);
export const isMysqlConfigured = () => mysqlStore.isMysqlConfigured();
