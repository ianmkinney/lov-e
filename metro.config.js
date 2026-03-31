const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

/** Expo Go omits ExpoRouterToolbarModule — use JS stub so requireNativeView never runs (removes toolbar warnings). */
const toolbarStub = path.resolve(__dirname, 'node_modules/expo-router/build/toolbar/native.js');
const origResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context?.originModulePath ?? '';
  const name = typeof moduleName === 'string' ? moduleName.replace(/\\/g, '/') : '';
  const fromStackToolbar =
    platform === 'ios' &&
    origin.includes('expo-router') &&
    name.includes('toolbar/native');
  if (fromStackToolbar) {
    return { filePath: toolbarStub, type: 'sourceFile' };
  }
  if (origResolve) {
    return origResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
