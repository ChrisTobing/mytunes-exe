import "xp.css/dist/XP.css";
import "./Profile.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";
import { useEffect, useState } from "react";
import ConfirmModal from "./ConfirmModal";

function Profile({ user, accessToken, setUser, setAccessToken, todayEntry, setTodayEntry, setPosted }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.username ?? "username");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);

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

  async function handleDeleteEntry() {
    const response = await fetch("http://localhost:8000/api/delete-entry/", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      setTodayEntry(null);
      setPosted(false);
      alert("Today's entry deleted successfully.");
    }
      else {
      alert("Failed to delete today's entry. Please try again.");
    }
    setShowDeleteEntryModal(false);
  }

  async function handleDeleteAccount() {
    const response = await fetch("http://localhost:8000/api/delete-account/", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      setAccessToken(null);
      setUser(null);
    } else {
      alert("Failed to delete account. Please try again.");
    }
    setShowDeleteModal(false);
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
            Currently Playing: <strong>{todayEntry?.song_name} - {todayEntry?.song_artist}</strong>
          </span>
          <button className="profile-delete-entry-btn" disabled={!todayEntry} onClick={() => setShowDeleteEntryModal(true)}>
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
        <button
          className="profile-delete-account-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          ⚠ Delete Account...
        </button>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Account"
          message={`Are you sure you want to permanently delete @${user?.username}'s account? This cannot be undone.`}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showDeleteEntryModal && (
        <ConfirmModal
          title="Delete Today's Entry"
          message={`Are you sure you want to delete today's entry? This cannot be undone.`}
          onConfirm={handleDeleteEntry}
          onCancel={() => setShowDeleteEntryModal(false)}
        />
      )}
    </div>
  );
}

export default Profile;
