import React from 'react'
import "xp.css/dist/XP.css"
import './SignUp.css'

function SignUp() {
  return (
    <div className="login-container">
        <div className="window">
            <div className="title-bar">
                <div className="title-bar-text">Sign Up</div>
                <div className="title-bar-controls">
                    <button aria-label="Help"></button>
                </div>
            </div>
            <div className="window-body">
                <h1>Welcome to MyTunes</h1>
            </div>
        </div>
    </div>
  )
}

export default SignUp