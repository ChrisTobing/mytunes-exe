import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "xp.css/dist/XP.css"
import './App.css'
import sampleAlbumArt from './assets/samplealbum.jpeg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="window-container">
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text">Mytunes.exe</div>
          </div>
          <div className="window-body">
            <menu role="tablist">
              <button aria-selected="true" aria-controls="EntryForm">Entry</button>
              <button aria-selected="false" aria-controls="Profile">Profile</button>
              <button aria-selected="false" aria-controls="Friends">Friends</button>
            </menu>
            <article role="tabpanel" aria-labelledby="MyTunes">
              <h5>You haven't entered a song today. Make an entry to see your friends' entries!</h5>
              <div className="field-row">
                <label for="text21">Search for:</label>
                <input type="text" id="text21" name="text21" />
                <button>Find</button>
              </div>
              <div className="sunken-panel" style={{ height: '150px', marginTop: '10px', overflowY: 'scroll', background: 'white' }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td>🎵</td>
                      <td>Bohemian Rhapsody - Queen</td>
                    </tr>
                    <tr>
                      <td>🎵</td>
                      <td>The Beatles - Hey Jude</td>
                    </tr>
                    <tr>
                      <td>🎵</td>
                      <td>The Rolling Stones - Satisfaction</td>
                    </tr>
                    <tr>
                      <td>🎵</td>
                      <td>The Who - Baba O'Riley</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="selected">
                <label for="text22">Selected:</label>
                <div className="selected-content">
                  <img src={sampleAlbumArt} alt="Sample Album Art" style={{ width: '50px', height: '50px', border: '2px solid gray', borderStyle: 'double' }} />
                  <div className="selected-content-text">
                    <p>JOJI - Slow Dancing in the Dark</p>
                    <p>Album: BALLADS 1</p>
                    <p>Date: 2026-02-05</p>
                  </div>
                </div>
              </div>
              <div className="field-row-stacked" style={{ marginTop: '10px', width: '100%' }}>
                <label for="text23">Comment:</label>
                <textarea id="text23" name="text23" rows="4" cols="50"></textarea>
              </div>
              <div className="pos-button-container" style={{ marginTop: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button>Submit</button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
