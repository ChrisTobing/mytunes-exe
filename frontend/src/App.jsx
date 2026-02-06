import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "xp.css/dist/XP.css"
import './App.css'
import sampleAlbumArt from './assets/samplealbum.jpeg'
import placeHolderAlbumArt from './assets/placeholderMusic.jpg'
import { searchToRows } from './utils/functions'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [songsData, setSongsData] = useState([])
  const [searchClicked, setSearchClicked] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(null)

  useEffect(() => {
    if (!searchClicked) return
    const query = inputValue.trim()
    if (!query) {
      setSearchClicked(false)
      return
    }
    fetch(`http://localhost:8000/api/songs/?query=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => setSongsData(data))
      .catch(error => console.error('Error:', error))
    setSearchClicked(false)
  }, [searchClicked, inputValue])

  const handleSearch = () => {
    setSearchClicked(true)
  }

  const handleTrackClick = (track_id, track_name, track_artist, track_album, track_albumArt) => {
    if (selectedTrack && selectedTrack.id === track_id) {
      setSelectedTrack(null)
    } else {
      setSelectedTrack({
        id: track_id,
        name: track_name,
        artist: track_artist,
        album: track_album,
        albumArt: track_albumArt
      })
    }
  }
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
                <input type="text" id="text21" name="text21" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                <button onClick={handleSearch}>Find</button>
              </div>
              <div className="sunken-panel" style={{ height: '150px', marginTop: '10px', overflowY: 'scroll', background: 'white' }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    {searchToRows(songsData, handleTrackClick, selectedTrack)}
                  </tbody>
                </table>
              </div>
              <div className="selected">
                <label for="text22">Selected:</label>
                <div className="selected-content">
                  <img src={selectedTrack ? selectedTrack.albumArt : placeHolderAlbumArt} alt="Sample Album Art"
                    style={{ width: '50px', height: '50px', border: '2px solid gray', borderStyle: 'double' }} />
                  <div className="selected-content-text">
                    <p>{selectedTrack ? selectedTrack.artist + ' - ' + selectedTrack.name : 'No song selected'}</p>
                    <p>Album: {selectedTrack ? selectedTrack.album : 'No album selected'}</p>
                    <p>Date: {new Date().toLocaleDateString()}</p>
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
