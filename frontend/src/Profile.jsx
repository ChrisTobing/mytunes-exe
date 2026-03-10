import "xp.css/dist/XP.css";
import "./Profile.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";
import { useEffect, useState } from "react";

function Profile({ user, accessToken, setUser }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.username ?? "username");

  function handleUpdateName() {
    setIsEditingName(true);
  }
  async function handleSave() {
    // Api call
    console.log("Saving new username:", nameInput);
    const response = await fetch("http://localhost:8000/api/update-username/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ new_username: nameInput.trim() }),
    });
    if (response.ok) {
      const data = await response.json();
      setUser((prev) => ({ ...prev, username: data.username }));
    } else {
      const errorData = await response.json();
      alert(errorData.error || "Failed to update username");
    }
    setIsEditingName(false);
  }

  useEffect(() => {
    setNameInput(user?.username ?? "username");
  }, [user]);

  return (
    <div className="profile-container">
      {/* Personal Information */}
      <fieldset className="profile-fieldset">
        <legend>Personal Information</legend>
        <div className="profile-personal-row">
          <div className="profile-avatar-col">
            <div className="sunken-panel profile-avatar-wrapper">
              <img
                src={placeholderAlbumArt}
                alt="Profile picture"
                className="profile-avatar"
              />
            </div>
            <button className="profile-btn-full" disabled>
              Change Picture...
            </button>
          </div>
          <div className="profile-info-col">
            <label className="profile-label">Display Name:</label>
            {isEditingName ? (
              <>
                <input
                  type="text"
                  className="profile-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
                <button onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  className="profile-input"
                  value={`@${user?.username ?? "username"}`}
                  readOnly
                />
                <button onClick={handleUpdateName}>Update Name</button>
              </>
            )}
          </div>
        </div>
      </fieldset>

      {/* Today's Tape */}
      <fieldset className="profile-fieldset">
        <legend>Today's Tape</legend>
        <div className="profile-tape-row">
          <span className="profile-tape-label">
            Currently Playing: <strong>Artist Name - Song Title</strong>
          </span>
          <button className="profile-delete-entry-btn" disabled>
            ✕ Delete Today's Entry
          </button>
        </div>
      </fieldset>

      {/* Listening Statistics */}
      <fieldset className="profile-fieldset">
        <legend>Listening Statistics</legend>
        <div className="profile-stats-row">
          <div className="profile-piechart-placeholder sunken-panel">
            <div className="profile-piechart-inner" />
          </div>
          <div className="profile-genres-col">
            <span className="profile-genres-heading">
              Top Genres This Month:
            </span>
            <ol className="profile-genres-list">
              <li>Hip-Hop/Rap (45%)</li>
              <li>Alternative Rock (30%)</li>
              <li>Pop (25%)</li>
            </ol>
          </div>
        </div>
      </fieldset>

      {/* Danger Zone */}
      <div className="profile-danger-row">
        <button className="profile-delete-account-btn" disabled>
          ⚠ Delete Account...
        </button>
      </div>
    </div>
  );
}

export default Profile;
