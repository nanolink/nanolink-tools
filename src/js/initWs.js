const { HTTPAGENT } = require("./common");

const ws = require("ws");
/**
 * Class that makes sure the correct User-Agent is set on the http header
 * @date 6/1/2023 - 12:35:16 PM
 *
 * @class WebSocketSub
 * @extends {ws.WebSocket}
 */
class WebSocketSub extends ws.WebSocket {
  /**
   * Creates an instance of WebSocketSub.
   * @date 6/1/2023 - 12:35:16 PM
   *
   * @constructor
   * @param {*} address
   * @param {*} protocols
   * @param {*} options
   */
  constructor(address, protocols, options) {
    super(address, protocols, {
      headers: { "User-Agent": HTTPAGENT },
      ...options,
    });
  }
}

/**
 * Intialize ws in the global scope
 * @date 6/1/2023 - 12:35:16 PM
 */
function initWs() {
  Object.assign(global, ws);
  global.WebSocket = WebSocketSub;
}
module.exports = { initWs };
