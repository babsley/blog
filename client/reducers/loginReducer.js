import constants from 'constants';

const initialState = {
  pending: false,
  user: null,
  isLogged: false,
  errors: []
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.LOGIN_REQUEST:
      return { ...state, pending: action.pending };
    case constants.LOGIN_SUCCESS:
      console.log('success');
      return { ...state, pending: action.pending, isLogged: action.isLogged };
    default:
      return state;
  }
};

export default loginReducer;
