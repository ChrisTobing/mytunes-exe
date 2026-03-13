import { useState } from "react";
import "xp.css/dist/XP.css";
import "./Friends.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";
import { API_BASE_URL } from "./config.js";

function Friends({ accessToken, hasPosted, friendEntries, setFriendEntries }) {
  const [selected, setSelected] = useState(null);
  const [addInput, setAddInput] = useState("");
  const [addError, setAddError] = useState("");

  const handleAdd = () => {
    const username = addInput.trim();
    if (!username) return;
    setAddError("");
    fetch(`${API_BASE_URL}/api/friends/add/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setFriendEntries((prev) => [
            ...prev,
            {
              id: data.id,
              friend_id: data.friend_id,
              friend_username: data.friend_username,
              today_entry: data.today_entry,
            },
          ]);
          setAddInput("");
        } else {
          setAddError(data.error);
        }
      })
      .catch(console.error);
  };

  const handleRemove = () => {
    if (!selected) return;
    fetch(`${API_BASE_URL}/api/friends/${selected.id}/remove/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(() => {
        setFriendEntries((prev) => prev.filter((f) => f.id !== selected.id));
        setSelected(null);
      })
      .catch(console.error);
  };

  const handleRowClick = (friend) => {
    setSelected((prev) => (prev?.id === friend.id ? null : friend));
  };

  return (
    <div className="friendEntries-container">
      {/* Quick Add */}
      <div className="friendEntries-add-section">
        <label className="friendEntries-add-label">Quick Add Friend:</label>
        <div className="friendEntries-add-row">
          <input
            type="text"
            className="friendEntries-add-input"
            placeholder="Type a username..."
            value={addInput}
            onChange={(e) => {
              setAddInput(e.target.value);
              setAddError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button onClick={handleAdd}>+ Add Contact</button>
        </div>
        {addError && <span className="friendEntries-add-error">{addError}</span>}
      </div>

      {/* Haven't Posted Today */}
      {!hasPosted && (
      <div className="post-disclaimer">
        <p>
          You haven't posted a song today. Make an entry to see your friendEntries'
            entries!
          </p>
        </div>
      )}

      {/* List heading */}
      <div className="friendEntries-list-heading">
        My Friends ({friendEntries.length})
      </div>

      {/* List box */}
      <div className="sunken-panel friendEntries-listbox">
        {friendEntries.length === 0 ? (
          <div className="friendEntries-empty">No friendEntries added yet.</div>
        ) : (
          friendEntries.map((f) => (
            <div
              key={f.id}
              className={`friendEntries-row${selected?.id === f.id ? " friendEntries-row--selected" : ""}`}
              onClick={() => handleRowClick(f)}
            >
              <img
                src={f.profile_picture_url || placeholderAlbumArt}
                alt=""
                className="friendEntries-avatar"
              />
              <span className="friendEntries-username">@{f.friend_username}</span>
              <span className="friendEntries-status">
                {f.today_entry
                  ? `— Listening to: ${f.today_entry.song_artist} - ${f.today_entry.song_name}`
                  : "— Hasn't posted today ... yet."}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Selected label */}
      <div className="friendEntries-selected-label">
        Selected:{" "}
        {selected ? (
          <strong>@{selected.friend_username}</strong>
        ) : (
          <span className="friendEntries-none">(none)</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="friendEntries-actions">
        <button disabled={!selected}>View Profile</button>
        <button disabled={!selected} onClick={handleRemove}>
          Remove Friend
        </button>
      </div>
    </div>
  );
}

export default Friends;
