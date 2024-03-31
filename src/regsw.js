window.addEventListener("DOMContentLoaded", (event) => {
  console.log('ready!')
  const swAllowedHostnames = ["localhost", "127.0.0.1", "10.0.0.1"];
  async function registerSW() {
    console.debug('registering sws...')
    const wispserver = `${window.location.origin.replace(/^https?:\/\//, 'ws://')}/wisp/`;
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    )
      throw new Error("Service workers cannot be registered without https.");
  
    if (!navigator.serviceWorker)
      throw new Error("Your browser doesn't support service workers.");
  
    await navigator.serviceWorker.register("/sw.js", {
      scope: '/uv/sw/',
    });
    console.log("UV Service Worker registered.");
    await navigator.serviceWorker.register("dynsw.js", {
      scope: '/dyn/',
    });
    const CurlMod = window.CurlMod
    console.log("Dynamic Service Worker registered.");
    BareMux.registerRemoteListener(navigator.serviceWorker.controller);
    BareMux.SetTransport("CurlMod.LibcurlClient", { wisp: wispserver, wasm: "https://cdn.jsdelivr.net/npm/libcurl.js@v0.6.7/libcurl.wasm" });
  }  
  registerSW();
});
