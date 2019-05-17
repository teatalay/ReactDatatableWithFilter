import axios from "axios";
import qs from "qs";

import { httpMethods } from "../constants/commonTypes";
import { isDefined } from "../utils";
import { baseURLSet } from "../constants/serviceUrls";

let instance = null;
let defaultResponse = {};
let defaultTimeout = 30000;
let baseURL = baseURLSet.default;
export function changeBaseURL(url) {
  baseURL = url || baseURLSet.default;
}

export function setupNetwork() {
  instance = axios.create({
    paramsSerializer: function(params) {
      return qs.stringify(params, { indices: false });
    }
  });
  instance.interceptors.request.use(
    config => {
      config.headers.common = {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: " application/json",
        ...config.headers.common
      };
      if (!isDefined(config.timeout)) config.timeout = defaultTimeout;
      const token = ""; //store.getState().authReducer.token;
      if (token)
        config.headers.common = {
          ...config.headers.common,
          Authorization: "Token ".concat(token)
        };
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    response => {
      return parseBody(response);
    },
    error => {
      if (error.response) {
        return parseError(error.response.data);
      } else {
        return Promise.reject(error);
      }
    }
  );
}

export function sendRequest({
  onBegin,
  onSuccess,
  onFail,
  onFinally,
  method = httpMethods.GET,
  params,
  headers,
  url,
  useDefaultBaseURL
} = {}) {
  if (!url) return;
  if (onBegin && onBegin instanceof Function) {
    //const action = onBegin();
    //if (action) store.dispatch(action);
  }
  const preURL = useDefaultBaseURL ? baseURLSet.default : baseURL;
  return new Promise((resolve, reject) => {
    call({ url: preURL.concat(url), params, method, headers })
      .then(result => {
        if (onSuccess && onSuccess instanceof Function) {
          //const action = onSuccess(result);
          //if (action) store.dispatch(action);
        }
        resolve(result);
      })
      .catch(error => {
        if (onFail && onFail instanceof Function) {
          //const action = onFail(error);
          //if (action) store.dispatch(action);
        }
        reject(error);
      })
      .then(() => {
        if (onFinally && onFinally instanceof Function) {
          //const action = onFinally();
          //if (action) store.dispatch(action);
        }
      });
  });
}

function call({ method = httpMethods.GET, params = {}, url, headers = {} }) {
  switch (method) {
    case httpMethods.GET:
      return instance.get(url, { params, headers });
    case httpMethods.POST:
      return instance.post(url, params, { headers });
    case httpMethods.PUT:
      return instance.put(url, params, { headers });
    case httpMethods.PATCH:
      return instance.patch(url, params, { headers });
    case httpMethods.DELETE:
      return instance.delete(url, { data: params }, { headers });
    default:
      return defaultResponse;
  }
}

function parseError(messages) {
  if (messages) {
    return Promise.reject({
      messages: messages instanceof Array ? messages : [messages]
    });
  } else {
    return Promise.reject({
      messages: [] //[store.getState().language.defaultErrorMessage]
    });
  }
}

function parseBody(response) {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    return parseError(response.data.messages);
  }
}

export let network = instance;
