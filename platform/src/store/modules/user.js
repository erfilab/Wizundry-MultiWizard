import userApi from '../../api/user';

const user = {
  state: {
    userInfo: {},
    trialInfo: {},

    token: '',
    roles: [],
    username: '',
    uid: '',
    status: '',

    connectedUsers: [],
  },

  getters: {
    userInfo: (state) => state.userInfo,
    trialInfo: (state) => state.trialInfo,

    token: (state) => state.token,
    roles: (state) => state.roles,
    username: (state) => state.username,
    uid: (state) => state.uid,
    status: (state) => state.status,
    connectedUsers: (state) => state.connectedUsers,
    isWizard: (state) => state.roles.includes('wizard') && !state.isAdmin,
    isAdmin: (state) => state.roles.includes('admin'),
    isUser: (state) => state.roles.includes('user') && state.roles.length < 2,
  },

  mutations: {
    SET_USER_INFO: (state, payload) => {
      // if (payload.logout) {
      //   state.userInfo = {};
      //   state.token = '';
      //   state.roles = [];
      //   state.username = '';
      //   state.uid = '';
      // } else {
      //   state.token = payload.token || state.token;
      //   state.roles = payload.roles || state.roles;
      //   state.username = payload.username || state.username;
      //   state.uid = payload.uid || state.uid;
      //   state.userInfo = {
      //     token: state.token,
      //     roles: state.roles,
      //     username: state.username,
      //     uid: state.uid
      //   } || state.userInfo;
      // }
      state.userInfo = {...payload}
    },
    SET_TRIAL_INFO: (state, payload) => {
      state.trialInfo = {...payload}
    },
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_CONNECTED_USER: (state, users) => {
      state.connectedUsers = users;
      // console.log('so many users', state.connectedUsers);
    },
    CLEAR_CONNECTED_USERS: (state) => {
      // console.log('clear connected users', state.connectedUsers);
      state.connectedUsers = [];
    },
    CLEAR_USER_INFO: (state) => {
      state.userInfo = {}
    }
  },

  actions: {
    // Login user
    LoginByPassword: async ({ commit, dispatch }, payload) => {
      const res = await userApi.loginUserByPassword({ ...payload })
      if (res.status < 300) {
        let { data } = res;

        data.roles = JSON.parse(data.roles);
        await commit('SET_TOKEN', data.token);
        await commit('SET_USER_INFO', data);
        await dispatch('GenerateRoutes', data);
      } else {
        throw new Error(res.message);
      }
    },

    StartTrial: async ({commit, dispatch}, payload) => {
      await commit('SET_USER_INFO', payload.userInfo)
      await commit('SET_TRIAL_INFO', payload.trialInfo)
    },

    GetUserInfo: async ({ commit, state }) => {
      console.log('[vuex.user] GetUserInfo');
      try {
        const response = await getUserInfo(state.token);

        // Since mockjs does not support custom status codes, it can only be hacked like this
        if (!response) {
          throw new Error('Verification failed, please login again.');
        }

        // Verify returned roles are a non-null array
        if (response.user.roles && response.user.roles.length === 0) {
          throw new Error('getInfo: roles must be a non-null array!');
        }

        commit('SET_USER_INFO', response.user);
      } catch (err) {
        console.warn('[vuex.user] GetUserInfo', err);
      }
    },

    LogOut: async ({ commit }) => {
      try {
        console.log('[vuex.user] LogOut');
        await commit('SET_USER_INFO', { logout: true });
        await commit('CLEAR_USER_INFO');
      } catch (err) {
        console.warn('[vuex.user] LogOut', err);
      }
    },

    // Dynamically modify permissions
    /* ChangeRoles: async ({ commit, dispatch }, role) => {
      try {
        console.log('[vuex.user] ChangeRoles', role);
        await commit('SET_TOKEN', role);
        const data = await getUserInfo(role);
        await commit('SET_USER_INFO', data);
        // Redraw the side menu after dynamically modifying the permissions
        await dispatch('GenerateRoutes', data);
      } catch (err) {
        console.warn('[vuex.user] ChangeRoles', err);
      }
    }, */
  },
};

export default user;
