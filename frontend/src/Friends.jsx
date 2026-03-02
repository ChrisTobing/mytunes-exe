import { useState, useEffect } from "react";
import "xp.css/dist/XP.css";
import "./Friends.css";

function Friends({ accessToken, user, hasPosted, setHasPosted, friendEntries }) {
  const [friends, setFriends] = useState(friendEntries);
  const [selected, setSelected] = useState(null);
  const [addInput, setAddInput] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    setFriends(friendEntries);
  }, [friendEntries]);

  const handleAdd = () => {
    const username = addInput.trim();
    if (!username) return;
    setAddError("");
    fetch("http://localhost:8000/api/friends/add/", {
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
          setFriends((prev) => [
            ...prev,
            {
              id: data.id,
              friend_id: data.friend_id,
              friend_username: data.friend_username,
              today_entry: null,
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
    fetch(`http://localhost:8000/api/friends/${selected.id}/remove/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(() => {
        setFriends((prev) => prev.filter((f) => f.id !== selected.id));
        setSelected(null);
      })
      .catch(console.error);
  };

  const handleRowClick = (friend) => {
    setSelected((prev) => (prev?.id === friend.id ? null : friend));
  };

  return (
    <div className="friends-container">
      {/* Quick Add */}
      <div className="friends-add-section">
        <label className="friends-add-label">Quick Add Friend:</label>
        <div className="friends-add-row">
          <input
            type="text"
            className="friends-add-input"
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
        {addError && <span className="friends-add-error">{addError}</span>}
      </div>

      {/* Haven't Posted Today */}
      {!hasPosted && (
      <div className="post-disclaimer">
        <p>
          You haven't posted a song today. Make an entry to see your friends'
            entries!
          </p>
        </div>
      )}

      {/* List heading */}
      <div className="friends-list-heading">
        My Friends ({friends.length})
      </div>

      {/* List box */}
      <div className="sunken-panel friends-listbox">
        {friends.length === 0 ? (
          <div className="friends-empty">No friends added yet.</div>
        ) : (
          friends.map((f) => (
            <div
              key={f.id}
              className={`friends-row${selected?.id === f.id ? " friends-row--selected" : ""}`}
              onClick={() => handleRowClick(f)}
            >
              <span className="friends-avatar" />
              <span className="friends-username">@{f.friend_username}</span>
              <span className="friends-status">
                {f.today_entry
                  ? `— Listening to: ${f.today_entry.song_artist} - ${f.today_entry.song_name}`
                  : "— Hasn't posted today ... yet."}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Selected label */}
      <div className="friends-selected-label">
        Selected:{" "}
        {selected ? (
          <strong>@{selected.friend_username}</strong>
        ) : (
          <span className="friends-none">(none)</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="friends-actions">
        <button disabled={!selected}>View Profile</button>
        <button disabled={!selected} onClick={handleRemove}>
          Remove Friend
        </button>
      </div>
    </div>
  );
}

export default Friends;
