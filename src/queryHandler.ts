import axios from "axios";
import { HTTPAGENT } from "./js/common";

export class QueryHandler {
  token?: string;
  url: string;
  logServerUrl?: string;
  buildInfo: any;
  apiToken: string;
  constructor(url: string, apiToken: string) {
    this.url = url;
    this.apiToken = apiToken;
  }
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
    return this.token;
  }
}
