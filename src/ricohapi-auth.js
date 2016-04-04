'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 */

const axios = require('axios');

const SCOPES = {
  auth: 'https://ucs.ricoh.com/scope/api/auth',
  discovery: 'https://ucs.ricoh.com/scope/api/discovery',
};

const AUTH_EP = 'https://auth.beta2.ucs.ricoh.com/auth';

class AuthClient {

  _transform(data) {
    const str = [];
    for (const p in data) {
      if (!data.hasOwnProperty(p)) continue;
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(data[p])}`);
    }
    return str.join('&');
  }

  _authRequest() {
    return {
      method: 'post',
      url: `${AUTH_EP}/token`,
      data: {
        client_id: this._clientId,
        client_secret: this._clientSecret,
        username: this._username,
        password: this._password,
        scope: this._scopes.join(' '),
        grant_type: 'password',
      },
    };
  }

  _discoveryRequest(scope, token) {
    return {
      method: 'post',
      url: `${AUTH_EP}/discovery`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        scope,
      },
    };
  }

  _refreshRequest() {
    return {
      method: 'post',
      url: `${AUTH_EP}/token`,
      data: {
        refresh_token: this._refreshToken,
        client_id: this._clientId,
        client_secret: this._clientSecret,
        grant_type: 'refresh_token',
      },
    };
  }

  _storeTokenInfo(r) {
    this.accessToken = r.access_token;
    this._refreshToken = r.refresh_token;
    this._expire = r.expires_in * 1000 + Date.now();
  }

  /**
   * @param {String} clientId - client ID
   * @param {String} clientSecret - client secret
   */
  constructor(clientId, clientSecret, params) {
    if (clientSecret === undefined) throw new Error('parameter error');

    this._scopes = [SCOPES.auth, SCOPES.discovery];
    this._clientId = clientId;
    this._clientSecret = clientSecret;

    const defaults = {
      transformRequest: [this._transform],
      withCredentials: false,
    };
    if (params && params.agent) {
      defaults.agent = params.agent;
    }
    this._r = axios.create(defaults);
  }

  /**
   * set OAuth resource owner credentials.
   *
   * @param {String} user - resource owner user ID
   * @param {String} pass - resource owner password
   */
  setResourceOwnerCreds(user, pass) {
    if (pass === undefined) throw new Error('parameter error');

    this._username = user;
    this._password = pass;
  }

  /**
   * open OAuth session
   *
   * @param {String} scope - OAuth scope
   * @returns {Promise} resolve when authenticated, reject otherwise
   */
  session(scope) {
    if (!this._username || !this._password) {
      throw new Error('state error: need resource owner credentials');
    }
    if (scope === undefined) throw new Error('parameter error');
    this._scopes.push(scope);

    return this._r.request(this._authRequest())
      .then(ret => this._r.request(this._discoveryRequest(scope, ret.data.access_token)))
      .then(ret => {
        this._storeTokenInfo(ret.data[scope]);
        return Promise.resolve(ret.data[scope]);
      });
  }

  /**
   * return valid access_token (update token if needed)
   *
   * @param {String} scope - OAuth scope
   * @returns {Promise} resolve when got, reject otherwise
   */
  getAccessToken() {
    if (this.accessToken === undefined) {
      throw new Error('state error: call session()');
    }
    if (Date.now() < this._expire) {
      return Promise.resolve(this.accessToken);
    }
    return this._r.request(this._refreshRequest())
      .then(ret => this._storeTokenInfo(ret))
      .then(() => Promise.resolve(this.accessToken));
  }

  static get SCOPES() {
    return {
      MStorage: 'https://ucs.ricoh.com/scope/api/udc2',
      VStream: 'https://ucs.ricoh.com/scope/api/udc2',
      CameraCtl: 'https://ucs.ricoh.com/scope/api/udc2',
    };
  }
}

exports.AuthClient = AuthClient;
