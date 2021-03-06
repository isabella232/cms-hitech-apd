import MockAdapter from 'axios-mock-adapter';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './auth';
import axios from '../util/api';

const mockStore = configureStore([thunk]);
const fetchMock = new MockAdapter(axios);

describe('auth actions', () => {
  it('requestLogin should create LOGIN_REQUEST action', () => {
    expect(actions.requestLogin()).toEqual({ type: actions.LOGIN_REQUEST });
  });

  it('completeLogin should create LOGIN_SUCCESS action', () => {
    expect(actions.completeLogin()).toEqual({ type: actions.LOGIN_SUCCESS });
  });

  it('failLogin should create LOGIN_FAILURE action', () => {
    expect(actions.failLogin('foo')).toEqual({
      type: actions.LOGIN_FAILURE,
      error: 'foo'
    });
  });

  it('completeLogout should create LOGOUT_SUCCESS action', () => {
    expect(actions.completeLogout()).toEqual({ type: actions.LOGOUT_SUCCESS });
  });

  describe('login (async)', () => {
    let localStorageSetItemSpy;

    beforeEach(() => {
      localStorageSetItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    });

    afterEach(() => {
      localStorageSetItemSpy.mockRestore();
      fetchMock.reset();
    });

    it('creates LOGIN_SUCCESS after successful auth', async () => {
      const store = mockStore({});
      fetchMock
        .onPost('/auth/login/nonce', { username: 'name' })
        .reply(200, { nonce: '123abc' });
      fetchMock
        .onPost('/auth/login', { username: '123abc', password: 'secret' })
        .reply(200, { user: { moop: 'moop', activities: [] }, token: 'xxx.yyy.zzz' });

      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        { type: actions.LOGIN_SUCCESS, data: { moop: 'moop', activities: [] } }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(localStorageSetItemSpy).toHaveBeenCalledWith('token', 'xxx.yyy.zzz');
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_FAILURE after unsuccessful auth', () => {
      const store = mockStore({});
      fetchMock.onPost().reply(401, 'foo');

      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'foo' }
      ];

      return store.dispatch(actions.login()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('logout (async)', () => {
    let localStorageRemoveItemSpy;

    beforeEach(() => {
      localStorageRemoveItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    });

    afterEach(() => {
      fetchMock.reset();
    });

    it('creates LOGOUT_SUCCESS after successful request', async () => {
      const store = mockStore({});
      fetchMock.onGet().reply(200);

      const expectedActions = [{ type: actions.LOGOUT_SUCCESS }];

      await store.dispatch(actions.logout());
      expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('token');
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('checkAuth (async)', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    it('creates AUTH_CHEK_SUCCESS after successful auth', () => {
      const store = mockStore({});
      fetchMock.onGet().reply(200, { name: 'bloop', activities: [] });

      const expectedActions = [
        { type: actions.AUTH_CHECK_REQUEST },
        {
          type: actions.AUTH_CHECK_SUCCESS,
          data: { name: 'bloop', activities: [] }
        }
      ];

      return store.dispatch(actions.checkAuth()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('creates AUTH_CHECK_FAILURE after unsuccessful auth and does not load APDs', () => {
      const store = mockStore({});
      fetchMock.onGet().reply(403);

      const expectedActions = [
        { type: actions.AUTH_CHECK_REQUEST },
        { type: actions.AUTH_CHECK_FAILURE }
      ];

      return store.dispatch(actions.checkAuth()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
