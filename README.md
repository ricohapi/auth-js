# Ricoh Auth Client for JavaScript

Auth Javascript Library for Ricoh API.

## Requirements

You need

    Ricoh API Client Credentials (client_id & client_secret)
    Ricoh ID (user_id & password)

If you don't have them, please register yourself and your client from [THETA Developers Website](http://contest.theta360.com/).

## Install

```sh
$ npm install ricohapi-auth
```

## Authentication

```sh
const AuthClient = require('ricohapi-auth').AuthClient;

const client = new AuthClient('<your_client_id>', '<your_client_secret>');
client.setResourceOwnerCreds('<your_user_id>', '<your_password>');
client.session(AuthClient.SCOPES.MStorage)
.then(result => console.log(result))
.catch(e => console.log(e));
```

## SDK API

### Constructor

```sh
const client = new AuthClient('<your_client_id>', '<your_client_secret>');
```

### Set resource owner credentials
 
This service only supports the resource owner password credentials flow.

```sh
client.setResourceOwnerCreds('<your_user_id>', '<your_password>');
```

### Open session

```sh
client.session('<scope>');
```
A Promise is returned.

### Obtain the valid access token

The access token will be refreshed automatically as needed.

```sh
client.getAccessToken();
```
A Promise is returned.

