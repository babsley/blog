import constants from 'constants';

export function loginPending(pending) {
  return {
    type: constants.LOGIN_REQUEST,
    pending
  }
}

export function loginSuccess(user) {
  return {
    type: constants.LOGIN_SUCCESS,
    pending: false,
    user,
    isLogged: true
  }
}

export function loginFail(errors = []) {
  return {
    type: constants.LOGIN_SUCCESS,
    pending: false,
    errors
  }
}


export function login(name, password) {
  return (dispatch) => {
    dispatch(loginPending(true));

    fetch(`${constants.API_URL}/users/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({ name, password })
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      throw new Error({ status: response.status });
    })
      .then(res => {
        dispatch(loginSuccess(res));
      })
      .catch((err) => {
        dispatch(loginFail(err));
      });
  }
}
