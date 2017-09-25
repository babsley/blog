import React, { Component } from 'react'

class Blog extends Component {
  render() {
    return (
      <div>
        <header className="page-header">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h1 className="page-header_heading">
                  Lorem Ipsum
                  <p>simply dummy text of the printing and typesetting industry.</p>
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="container">
          <div className="row">
            <div className="main-intro main-intro_btn">
              <div className="col-md-12"><h2 className="heading heading--dashed">Posts</h2>
                <button className="btn btn--success">
                  Create New
                  <i className="icon fa fa-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="posts posts_post clearfix">
              <div className="posts-item post-item_post-control col-sm-6 col-md-4">
                <div className="post-wrap">
                  <h4 className="post-heading">Lorem ipsum dolor sit amet.</h4>
                  <div back-img="{{post.image}}" className="post-bg"></div>
                  <ul className="post-control">
                    <li className="control-item">
                      <a className="post-control_link control-link">
                        <i className="icon fa fa-external-link"></i>
                      </a>
                    </li>
                    <li className="control-item">
                      <a className="post-control_link control-link">
                        <i className="icon fa fa-pencil-square-o"></i>
                      </a>
                    </li>
                    <li className="control-item">
                      <a className="post-control_link control-link">
                        <i className="icon fa fa-trash"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ul className="pagin">
                <li className="pagin-item">
                  <button className="btn pagin_btn">First</button>
                </li>
                <li className="pagin-item">
                  <button className="btn pagin_btn active"> 1
                  </button>
                </li>
                <li className="pagin-item">
                  <button className="btn pagin_btn">Last
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Blog;
