const { HTTPAGENT } = require("./common");

const ws = require("ws");
class WebSocketSub extends ws.WebSocket {
  constructor(address, protocols, options) {
    super(address, protocols, {
      headers: { "User-Agent": HTTPAGENT },
      ...options,
    });
  }
}

function initWs() {
  Object.assign(global, ws);
  global.WebSocket = WebSocketSub;
}
module.exports = { initWs };
