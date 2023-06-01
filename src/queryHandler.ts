import axios from "axios";
import { HTTPAGENT } from "./js/common";

/**
 * Description placeholder
 * @date 6/1/2023 - 9:51:11 AM
 *
 * @export
 * @class QueryHandler
 */
export class QueryHandler {
  /**
   * Login token received from the server
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @type {?string}
   */
  token?: string;
  /**
   * Url of the coreserver
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @type {string}
   */
  url: string;
  /**
   * Url of the logserver
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @type {?string}
   */
  logServerUrl?: string;
  /**
   * Object containing server build information
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @type {*}
   */
  buildInfo: any;
  /**
   * The API token received from nanolink
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @type {string}
   */
  apiToken: string;
  /**
   * Object containing customer information
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @type {*}
   */
  customer: any;
  /**
   * Creates an instance of QueryHandler.
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @constructor
   * @param {string} url - Url of coreserver
   * @param {string} apiToken - The API token received from nanolink
   */
  constructor(url: string, apiToken: string) {
    this.url = url;
    this.apiToken = apiToken;
  }
  /**
   * Perform a GraphQL query again server in url
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @param {string} url - Url of the server
   * @param {string} query - The graphql query
   * @param {?*} [variables] - The graphql query variables
   * @param {?number} [timeout]  - Timeout after this period in seconds
   * @param {?string} [token] - The security jwt token received from login
   * @returns {*}
   */
  postQuery(
    url: string,
    query: string,
    variables?: any,
    timeout?: number,
    token?: string
  ) {
    token = this.token ?? token;
    let headers;
    if (token) {
      headers = {
        Authorization: `Bearer ${token}`,
        "User-Agent": HTTPAGENT,
      };
    } else {
      headers = {
        "User-Agent": HTTPAGENT,
      };
    }
    var result = axios.post(
      url,
      {
        query: query,
        variables: variables,
      },
      {
        timeout: timeout ?? 20000,
        headers: headers,
        validateStatus: function (status) {
          return (
            (status >= 200 && status < 300) || status == 400 || status == 500
          );
        },
      }
    );
    return result;
  }
  /**
   * Login to coreserver
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @async
   * @returns {unknown}
   */
  async login() {
    let result = await this.postQuery(
      this.url,
      `{
            auth_externalloginfull(logintoken: "${this.apiToken}") {
              result {
                token
                buildInfo {
                  serverBranch
                  serverVersion
                  serverBuildNumber
                  serverBuildVariant
                  serverBuildDate
                  serverBuildRevision
                  serverBuildRevisionShort
                }
                logServerUrl
                customer {
                  customerId
                  companyName
                }       
              }
              groupVersion
              errors {
                message
                errorKey
                detailDescription
              }
            }
        }`
    );
    if (result.data?.errors) {
      throw result.data?.errors[0];
    }
    if (result.data.data?.auth_externalloginfull?.errors) {
      throw result.data.data?.auth_externalloginfull?.errors[0];
    }
    this.token = result?.data?.data?.auth_externalloginfull?.result.token;
    this.logServerUrl =
      result?.data?.data?.auth_externalloginfull?.result.logServerUrl;
    this.buildInfo =
      result?.data?.data?.auth_externalloginfull?.result.buildInfo;
    this.customer = result?.data?.data?.auth_externalloginfull?.result.customer;
    return this.token;
  }
  /**
   * Login to logserver
   * @date 6/1/2023 - 9:51:11 AM
   *
   * @async
   * @returns {unknown}
   */
  async loginLog() {
    if (!this.logServerUrl) {
      throw "Log serverurl is not set"
    }
    let result = await this.postQuery(`${this.logServerUrl}/api/log`, `{auth_login(pwdcheck:"${this.apiToken}")}`)
    if (result.data?.errors) {
      throw result.data?.errors[0];
    }
    let t = result?.data?.data?.auth_login
    if (!t) {
      throw "Failed login in to log server";
    }
    if (!this.token) {
      this.token = t;
    }
    return this.token;
  }
}
