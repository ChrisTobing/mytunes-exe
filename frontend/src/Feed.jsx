import { useState } from "react";
import "xp.css/dist/XP.css";
import "./Feed.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";

function Feed({ user }) {
  const entry = {
    username: "CoolFriend12",
    song_name: "Wonderwall",
    song_artist: "Oasis",
    song_album_art: null,
    comment: "This defines my entire Tuesday vibe...",
    likes: 4,
  };

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(entry.likes);
  const [liked, setLiked] = useState(false);

  const handleSend = () => {
    const text = commentInput.trim();
    if (!text) return;
    setComments([...comments, { username: user?.username || "You", text }]);
    setCommentInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="feed-container">
      {/* Navigation + Album Art */}
      <div className="feed-nav">
        <button className="feed-nav-btn">&lt;</button>
        <div className="sunken-panel feed-album-art-panel">
          <img
            src={entry.song_album_art || placeholderAlbumArt}
            alt="Album Art"
            className="feed-album-art"
          />
        </div>
        <button className="feed-nav-btn">&gt;</button>
      </div>

      <hr className="feed-divider" />

      {/* Header */}
      <div className="feed-header">
        <img src={placeholderAlbumArt} alt="User avatar" className="feed-avatar" />
        <div className="feed-header-info">
          <span className="feed-posted-by">@{entry.username}</span>
        </div>
      </div>

      {/* Song & Artist */}
      <div className="feed-fields">
        <div className="feed-field-row">
          <label className="feed-field-label">Song:</label>
          <input type="text" readOnly value={`[ ${entry.song_name} ]`} className="feed-field-input" />
        </div>
        <div className="feed-field-row">
          <label className="feed-field-label">Artist:</label>
          <input type="text" readOnly value={`[ ${entry.song_artist} ]`} className="feed-field-input" />
        </div>
      </div>

      {/* Chatbox */}
      <div className="sunken-panel feed-chatbox">
        {/* Poster's original comment */}
        <div className="chat-message chat-message--poster">
          <span className="chat-username">@{entry.username}:</span>
          <span className="chat-text">{entry.comment}</span>
        </div>

        {/* Subsequent comments */}
        {comments.map((c, i) => (
          <div key={i} className={`chat-message ${i % 2 === 0 ? "chat-message--even" : ""}`}>
            <span className="chat-username">@{c.username}:</span>
            <span className="chat-text">{c.text}</span>
          </div>
        ))}
      </div>

      {/* Input row */}
      <div className="feed-input-row">
        <button className="feed-like-btn" onClick={handleLike} title="Like">
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <input
          type="text"
          className="feed-comment-input"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Feed;
