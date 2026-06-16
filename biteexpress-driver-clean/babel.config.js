module.exports = function (api) {
  api.cache(true);
  return {
    // Disable deprecated __self/__source injection that conflicts with React 19's
    // automatic runtime.
    presets: [
      [
        'babel-preset-expo',
        {
          jsxRuntime: 'automatic',
          useTransformReactJSXSelf: false,
          useTransformReactJSXSource: false
        }
      ]
    ]
  };
};
