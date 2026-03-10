import { useState, useEffect } from "react";
import "xp.css/dist/XP.css";
import "./App.css";
import Feed from "./Feed";
import EntryForm from "./EntryForm";
import Friends from "./Friends";
import Profile from "./Profile";
import Taskbar from "./Taskbar";

function App({ accessToken, setAccessToken, user, setUser }) {
  const [inputValue, setInputValue] = useState("");
  const [songsData, setSongsData] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [currentComment, setCurrentComment] = useState("");
  const [comments, setComments] = useState([]);
  const [hasPosted, setPosted] = useState(true);
  const [todayEntry, setTodayEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("entry");
  const [friendEntries, setFriendEntries] = useState([]);

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

  useEffect(() => {
    fetch("http://localhost:8000/api/has-posted/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setPosted(data.has_posted);
        setTodayEntry(data.entry || null);
        console.log(data);
      })
      .catch((error) => console.error("Error:", error));
  }, [accessToken]);

  useEffect(() => {
    if (!hasPosted) return;
    fetch("http://localhost:8000/api/friends/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => setFriendEntries(data))
      .catch((error) => console.error("Error:", error));
  }, [accessToken, hasPosted]);

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
    track_genre,
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
        genre: track_genre,
      });
    }
  };

  async function handleSubmit() {
    if (currentComment.length === 0) {
      alert("Please add at least one comment");
      return;
    }
    const newComments = [
      ...comments,
      { username: user.username, text: currentComment },
    ];
    setComments(newComments);
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
        song_genre: selectedTrack.genre || "",
        comments: newComments,
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
      setTodayEntry({
        id: data.entry,
        username: user.username,
        song_name: selectedTrack.name,
        song_artist: selectedTrack.artist,
        song_album: selectedTrack.album,
        song_album_art: selectedTrack.albumArt,
        song_preview_url: selectedTrack.previewUrl,
        comments: newComments,
        created_at: new Date().toISOString(),
      });
      setPosted(true);
      setCurrentComment("");
      setComments([]);
      setSelectedTrack(null);
      console.log(todayEntry);
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
              <button
                aria-selected={activeTab === "entry"}
                aria-controls="EntryForm"
                onClick={() => setActiveTab("entry")}
              >
                Entry
              </button>
              <button
                aria-selected={activeTab === "profile"}
                aria-controls="Profile"
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                aria-selected={activeTab === "friends"}
                aria-controls="Friends"
                onClick={() => setActiveTab("friends")}
              >
                Friends
              </button>
            </menu>
            <article role="tabpanel">
              {activeTab === "entry" &&
                (hasPosted ? (
                  <Feed
                    user={user}
                    entry={todayEntry}
                    friendEntries={friendEntries}
                    accessToken={accessToken}
                  />
                ) : (
                  <EntryForm
                    setPosted={setPosted}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSearch={handleSearch}
                    handleTrackClick={handleTrackClick}
                    selectedTrack={selectedTrack}
                    currentComment={currentComment}
                    setCurrentComment={setCurrentComment}
                    handleSubmit={handleSubmit}
                    songsData={songsData}
                  />
                ))}
              {activeTab === "profile" && (
                <Profile
                  user={user}
                  accessToken={accessToken}
                  setUser={setUser}
                  setAccessToken={setAccessToken}
                  todayEntry={todayEntry}
                  setTodayEntry={setTodayEntry}
                  setPosted={setPosted}
                />
              )}
              {activeTab === "friends" && (
                <Friends
                  accessToken={accessToken}
                  hasPosted={hasPosted}
                  friendEntries={friendEntries}
                  setFriendEntries={setFriendEntries}
                />
              )}
            </article>
          </div>
        </div>
      </div>
      <Taskbar />
    </>
  );
}

export default App;
