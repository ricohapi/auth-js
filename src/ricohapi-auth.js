'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 */

const VCPClient = require('vcp-service-client').VCPClient;

const AUTH_ENDPOINT = 'https://auth.beta2.ucs.ricoh.com';
const SCOPES = {
  auth: 'https://ucs.ricoh.com/scope/api/auth',
  discovery: 'https://ucs.ricoh.com/scope/api/discovery',
  udc2: 'https://ucs.ricoh.com/scope/api/udc2',
};

class AuthClient {

  constructor(clientId, clientSecret, params) {
    if (clientSecret === undefined) throw new Error('parameter error');

    this._authParams = {
      grant_type: 'password',
      scope: [SCOPES.auth, SCOPES.discovery],
      client_id: clientId,
      client_secret: clientSecret,
    };
    if (!params) return;
    Object.keys(params).forEach(k => {
      if (typeof params[k] !== 'object') {
        this[k] = params[k];
      } else {
        Object.keys(params[k]).forEach(k2 => {
          this[k][k2] = params[k][k2];
        });
      }
    });
  }

  setResourceOwnerCreds(user, pass) {
    this._authParams.username = user;
    this._authParams.password = pass;
  }

  session(scope) {
    this._authParams.scope.push(scope)
    this._vcpClient = new VCPClient(AUTH_ENDPOINT, this._authParams);

    return new Promise((resolve, reject) => {
      this._vcpClient.auth()
        .then(() => this._vcpClient.discovery(scope))
        .then(result => {
          this.accessToken = result[scope].access_token;
          resolve(this.accessToken);
        })
        .catch(reject);
    });
  }

  static get SCOPES() {
    return {
      MStorage: SCOPES.udc2,
      VStream: SCOPES.udc2,
      CameraCtl: SCOPES.udc2,
    }
  }

}

exports.AuthClient = AuthClient;
