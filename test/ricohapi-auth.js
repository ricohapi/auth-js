const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const AXStub = sinon.stub().returns(
  Promise.resolve({
    data: {
      access_token: 'atoken',
      scope1: {
        access_token: 'atoken2',
        refresh_token: 'rtoken',
        expires_in: 119,
      }
    }
  })
);

const A = proxyquire('../src/ricohapi-auth', {
  'axios': {
    create: () => {
      return {
        request: AXStub
      }
    },
  },
});

const AuthClient = A.AuthClient;

beforeEach(() => {
  AXStub.reset();
});

describe('AuthClient', () => {
  describe('constructor()', () => {
    it('success', () => {
      const a = new AuthClient('cid', 'csec');
      expect(a._scopes[0]).have.string('https://ucs.ricoh.com/scope/api/auth');
      expect(a._scopes[1]).have.string('https://ucs.ricoh.com/scope/api/discovery');
      expect(a._clientId).have.string('cid');
      expect(a._clientSecret).have.string('csec');
    });

    it('parameter error', done => {
      try {
        new AuthClient('a');
      } catch (e) {
        expect(e.toString()).to.have.string('parameter error');
        done();
      }
    });
  });

  describe('setResourceOwnerCreds()', () => {
    it('success', () => {
      const a = new AuthClient('cid', 'csec');
      a.setResourceOwnerCreds('uid', 'upass');
      expect(a._username).have.string('uid');
      expect(a._password).have.string('upass');
    });

    it('parameter error', done => {
      const a = new AuthClient('cid', 'csec');
      try {
        a.setResourceOwnerCreds('uid');
      } catch (e) {
        expect(e.toString()).to.have.string('parameter error');
        done();
      }
    });

  });

  describe('SCOPES()', () => {
    it('success', () => {
      expect(AuthClient.SCOPES.MStorage).to.have.string('https://ucs.ricoh.com/scope/api/udc2');
      expect(AuthClient.SCOPES.VStream).to.have.string('https://ucs.ricoh.com/scope/api/udc2');
      expect(AuthClient.SCOPES.CameraCtl).to.have.string('https://ucs.ricoh.com/scope/api/udc2');
    });
  });

  describe('session()', () => {
    it('success', () => {
      const a = new AuthClient('cid', 'csec');
      a.setResourceOwnerCreds('uid', 'upass');
      return a.session('scope1')
        .then(() => {
          expect(AXStub.firstCall.args[0].url).to.have.string('https://auth.beta2.ucs.ricoh.com/auth/token');
          expect(AXStub.firstCall.args[0].data.client_id).to.have.string('cid');
          expect(AXStub.firstCall.args[0].data.client_secret).to.have.string('csec');
          expect(AXStub.firstCall.args[0].data.username).to.have.string('uid');
          expect(AXStub.firstCall.args[0].data.password).to.have.string('upass');
          expect(AXStub.firstCall.args[0].data.scope).to.have.string('https://ucs.ricoh.com/scope/api/auth https://ucs.ricoh.com/scope/api/discovery scope1');
          expect(AXStub.firstCall.args[0].data.grant_type).to.have.string('password');

          expect(AXStub.secondCall.args[0].headers.Authorization).to.have.string('Bearer atoken');
          expect(AXStub.secondCall.args[0].url).to.have.string('https://auth.beta2.ucs.ricoh.com/auth/discovery');
          expect(AXStub.secondCall.args[0].data.scope).to.have.string('scope1');

          expect(a.accessToken).to.have.string('atoken');
        });
    });

    it('parameter error', done => {
      const a = new AuthClient('cid', 'csec');
      a.setResourceOwnerCreds('uid', 'upass');
      try {
        a.session();
      } catch (e) {
        expect(e.toString()).to.have.string('parameter error');
        done();
      }
    });

    it('state error', done => {
      const a = new AuthClient('cid', 'csec');
      try {
        a.session('scope1');
      } catch (e) {
        expect(e.toString()).to.have.string('state error');
        done();
      }
    });
  });

  describe('getAccessToken()', () => {
    it('success', () => {
      const a = new AuthClient('cid', 'csec');
      a.setResourceOwnerCreds('uid', 'upass');
      return a.session('scope1')
        .then(() => {
          a.getAccessToken();
          expect(a.accessToken).to.have.string('atoken');
        });
    });

    it('state error', done => {
      const a = new AuthClient('cid', 'csec');
      try {
        a.getAccessToken();
      } catch (e) {
        expect(e.toString()).to.have.string('state error');
        done();
      }
    });

    it('refresh success', () => {
      const a = new AuthClient('cid', 'csec', { proxy: 'def' });
      a.setResourceOwnerCreds('uid', 'upass');
      return a.session('scope1')
        .then(() => {
          a._expire = a._expire - 1000 * 1000;
          a.getAccessToken();

          expect(AXStub.lastCall.args[0].url).to.have.string('https://auth.beta2.ucs.ricoh.com/auth/token');
          expect(AXStub.lastCall.args[0].data.refresh_token).to.have.string('rtoken');
          expect(AXStub.lastCall.args[0].data.client_id).to.have.string('cid');
          expect(AXStub.lastCall.args[0].data.client_secret).to.have.string('csec');
          expect(AXStub.lastCall.args[0].data.grant_type).to.have.string('refresh_token');
        });
    });
  });

  describe('_transform()', () => {
    it('success', () => {
      const a = new AuthClient('cid', 'csec');
      expect(a._transform({ a: 'b', c: 'd' })).to.have.string('a=b&c=d');
    });
  });

});
