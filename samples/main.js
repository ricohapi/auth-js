'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 *
 * main.js for browser sample
 */

const AuthClient = require('../src/ricohapi-auth').AuthClient;
const CONFIG = require('./config').CONFIG;

const client = new AuthClient(CONFIG.clientId, CONFIG.clientSecret);
client.setResourceOwnerCreds(CONFIG.userId, CONFIG.userPass);

function log(str) {
  const p = document.createElement('p');
  const textnode = document.createTextNode(str);
  p.appendChild(textnode);
  document.body.appendChild(p);
}

document.addEventListener('DOMContentLoaded', () => {
  log('loaded');

  document.querySelector('#test').addEventListener('click', () => {
    log('test clicked')
    const client = new AuthClient(CONFIG.clientId, CONFIG.clientSecret);
    client.setResourceOwnerCreds(CONFIG.userId, CONFIG.userPass);
    client.session(AuthClient.SCOPES.MStorage)
    .then(ret => {
      log(JSON.stringify(ret));
    })
    .catch(e => log(e));
  });

});
