import React, { Component } from 'react';

export default class Preloader extends Component {
  render() {
    const preloader =
      <div className="preloader">
        <div className="preloader-circle">
          <div className="preloader-wrapper active">
            <div className="spinner-layer spinner-blue-only">
              <div className="circle-clipper left">
                <div className="circle"/>
              </div>
              <div className="gap-patch">
                <div className="circle"/>
              </div>
              <div className="circle-clipper right">
                <div className="circle"/>
              </div>
            </div>
          </div>
        </div>
      </div>;


    return (
      this.props.pending ? preloader : null
    )
  }
}
