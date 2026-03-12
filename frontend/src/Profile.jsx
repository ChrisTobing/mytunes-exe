import "xp.css/dist/XP.css";
import "./Profile.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";
import { useEffect, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";

function Profile({ user, accessToken, setUser, setAccessToken, todayEntry, setTodayEntry, setPosted }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.username ?? "username");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);
  const [genreStats, setGenreStats] = useState({});
  const fileInputRef = useRef(null);
  
  async function handlePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // FormData is required for file uploads — unlike JSON, it encodes the file
    // as multipart/form-data so Django's request.FILES can receive it.
    const formData = new FormData();
    formData.append("profile_picture", file);
    const response = await fetch("http://localhost:8000/api/upload-profile-pic/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      setUser((prev) => ({ ...prev, profile_picture_url: data.profile_picture_url }));
    } else {
      alert("Failed to upload picture. Please try again.");
    }
  }

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

    useEffect(() => {
      async function fetchGenreStats() {
        const response = await fetch("http://localhost:8000/api/genre-stats/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGenreStats(data);
        } else {
          console.error("Failed to fetch genre stats");
        }
      }
      fetchGenreStats();
    }, [accessToken]);

  const pieSrc = genreStats.svg
    ? `data:image/svg+xml,${encodeURIComponent(genreStats.svg)}`
    : null;

  return (
    <div className="profile-container">
      {/* Personal Information */}
      <fieldset className="profile-fieldset">
        <legend>Personal Information</legend>
        <div className="profile-personal-row">
          <div className="profile-avatar-col">
            <div className="sunken-panel profile-avatar-wrapper">
              <img
                src={user?.profile_picture_url || placeholderAlbumArt}
                alt="Profile picture"
                className="profile-avatar"
              />
            </div>
            {/* Hidden file input — the button below triggers it programmatically.
                This avoids styling a native file input, which is notoriously hard. */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handlePictureChange}
            />
            <button className="profile-btn-full" onClick={() => fileInputRef.current.click()}>
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
            {pieSrc && <img src={pieSrc} alt="Genre pie chart" className="profile-piechart-inner" />}
          </div>
          <div className="profile-genres-col">
            <span className="profile-genres-heading">
              Top Genres This Month:
            </span>
            <ol className="profile-genres-list">
              {genreStats.genres?.map((item) => (
                <li key={item.genre} style={{ color: item.color }}>
                  {item.genre}: {item.percentage}%
                </li>
              ))}
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
