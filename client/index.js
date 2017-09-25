import React from 'react';
import { render } from 'react-dom';
import App from 'containers/App';
import { AppContainer } from 'react-hot-loader';
import styles from 'assets/styles/main.scss';

const renderApp = App => {
  render(
    <AppContainer>
      <App/>
    </AppContainer>,
    document.getElementById('app')
  )
};

if (module.hot) {
  module.hot.accept('containers/App', () => renderApp(App));
}

renderApp(App);
