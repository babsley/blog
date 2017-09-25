import React, { Component } from 'react';

export default class Form extends Component {
  constructor(props) {
    super();
    this.name = null;
    this.password = null;
    this.login = props.login;
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();
    this.login(this.name.value, this.password.value);
  }

  render() {
    return (
      <form className="form login_form" name="form" onSubmit={this.submit} autoComplete="off">
        <label className="form-label">
          <input className="form-input" type="text" placeholder="Name" ref={input => this.name = input}/>
          <i className="icon fa fa-user"/>
        </label>
        <label className="form-label">
          <input className="form-input" type="password" placeholder="Password" ref={input => this.password = input}/>
          <i className="icon fa fa-lock"/>
        </label>
        <button className="btn btn--success" type="submit">Login</button>
      </form>
    )
  }
}
