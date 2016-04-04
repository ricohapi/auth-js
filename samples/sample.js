'use strict';
/*
 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
 * See LICENSE for more information
 */

const AuthClient = require('../src/ricohapi-auth').AuthClient;
const CONFIG = require('./config').CONFIG;

const client = new AuthClient(CONFIG.clientId, CONFIG.clientSecret);
client.setResourceOwnerCreds(CONFIG.userId, CONFIG.userPass);
client.session(AuthClient.SCOPES.MStorage)
.then(ret => {
  console.log(ret);
})
.catch(e => console.log(e));
