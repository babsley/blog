import { createStore, applyMiddleware } from 'redux';
import { compose } from 'redux';
import thunk from 'redux-thunk';
import loginReducer from 'reducers/loginReducer';

const store = createStore(
  loginReducer,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;
