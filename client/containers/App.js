import React, { Component } from 'react';
import store from 'store/index';
import { Provider } from 'react-redux'
import Routes from 'routes/index';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Routes/>
      </Provider>
    )
  }
}
