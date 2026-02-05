declare module '@sqlite.org/sqlite-wasm' {
  const init: (config?: unknown) => Promise<any>;
  export default init;
}
