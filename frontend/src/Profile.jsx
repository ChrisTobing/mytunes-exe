import "xp.css/dist/XP.css";
import "./Profile.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";

function Profile({ user }) {
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
            <input
              type="text"
              className="profile-input"
              readOnly
              value={`@${user?.username ?? "username"}`}
            />
            <button disabled>Update Name</button>
          </div>
        </div>
      </fieldset>

      {/* Today's Tape */}
      <fieldset className="profile-fieldset">
        <legend>Today's Tape</legend>
        <div className="profile-tape-row">
          <span className="profile-tape-label">
            Currently Playing:{" "}
            <strong>Artist Name - Song Title</strong>
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
            <span className="profile-genres-heading">Top Genres This Month:</span>
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
