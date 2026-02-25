import { useState, useEffect } from "react";
import "xp.css/dist/XP.css";
import "./App.css";
import Feed from "./Feed";
import EntryForm from "./EntryForm";

function App({ accessToken, user, setUser }) {
  const [inputValue, setInputValue] = useState("");
  const [songsData, setSongsData] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [comment, setComment] = useState("");
  const [hasPosted, setPosted] = useState(true);
  useEffect(() => {
    if (!searchClicked) return;
    const query = inputValue.trim();
    if (!query) {
      setSearchClicked(false);
      return;
    }
    fetch(
      `http://localhost:8000/api/songs/?query=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
      .then((response) => response.json())
      .then((data) => setSongsData(data))
      .catch((error) => console.error("Error:", error));
    setSearchClicked(false);
  }, [searchClicked, inputValue]);

  const handleSearch = () => {
    setSearchClicked(true);
  };

  const handleTrackClick = (
    track_id,
    track_name,
    track_artist,
    track_album,
    track_albumArt,
    track_previewUrl,
  ) => {
    if (selectedTrack && selectedTrack.id === track_id) {
      setSelectedTrack(null);
    } else {
      setSelectedTrack({
        id: track_id,
        name: track_name,
        artist: track_artist,
        album: track_album,
        albumArt: track_albumArt,
        previewUrl: track_previewUrl,
      });
    }
  };

  async function handleSubmit() {
    const response = await fetch("http://localhost:8000/api/add-entry/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        song_id: selectedTrack.id,
        song_name: selectedTrack.name,
        song_artist: selectedTrack.artist,
        song_album: selectedTrack.album,
        song_album_art: selectedTrack.albumArt,
        song_preview_url: selectedTrack.previewUrl,
        comment: comment,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const profileRes = await fetch("http://localhost:8000/api/profile/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (profileRes.ok) {
        const updatedProfile = await profileRes.json();
        setUser(updatedProfile);
        console.log(updatedProfile);
      }
      alert(data.message);
      setComment("");
      setSelectedTrack(null);
    } else {
      console.error("Error:", response.statusText);
      alert(response.statusText);
    }
  }

  return (
    <>
      <div className="window-container">
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text">
              {user ? `Welcome, ${user.username}` : "Mytunes.exe"}
            </div>
            <div className="title-bar-controls">
              <button aria-label="Close"></button>
            </div>
          </div>
          <div className="window-body">
            <menu role="tablist" className="tablist">
              <button aria-selected="true" aria-controls="EntryForm">
                Entry
              </button>
              <button aria-selected="false" aria-controls="Profile">
                Profile
              </button>
              <button aria-selected="false" aria-controls="Friends">
                Friends
              </button>
            </menu>
            <article role="tabpanel" aria-labelledby="Welcome, {user.username}">
              {hasPosted ? (
                <Feed />
              ) : (
                <EntryForm
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleSearch={handleSearch}
                  handleTrackClick={handleTrackClick}
                  selectedTrack={selectedTrack}
                  comment={comment}
                  setComment={setComment}
                  handleSubmit={handleSubmit}
                  songsData={songsData}
                />
              )}
            </article>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
