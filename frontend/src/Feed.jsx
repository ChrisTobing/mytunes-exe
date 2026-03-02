import { useState } from "react";
import "xp.css/dist/XP.css";
import "./Feed.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";
import { combineFeed } from "./utils/functions";

function Feed({ user, entry, friendEntries }) {
  const combinedFeed = combineFeed(entry, friendEntries);
  console.log(combinedFeed);
  const feedLength = combinedFeed.length;
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

  const handlePrevious = () => {
    if (currentIndex === 0) {
      setCurrentIndex(feedLength - 1);
    } else setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex === feedLength - 1) {
      setCurrentIndex(0);
    } else setCurrentIndex(currentIndex + 1);
  };

  if (!entry) return null;

  return (
    <div className="feed-container">
      {/* Navigation + Album Art */}
      <span className="feed-date-header">{today}</span>
      <div className="feed-nav">
        <button className="feed-nav-btn" onClick={handlePrevious}>&lt;</button>
        <div className="feed-album-art-wrapper">
          <div className="sunken-panel feed-album-art-panel">
            <img
              src={
                combinedFeed[currentIndex].song_album_art || placeholderAlbumArt
              }
              alt="Album Art"
              className="feed-album-art"
            />
          </div>
        </div>
        <button className="feed-nav-btn" onClick={handleNext}>&gt;</button>
      </div>

      <hr className="feed-divider" />

      {/* Header */}
      <div className="feed-header">
        <img
          src={placeholderAlbumArt}
          alt="User avatar"
          className="feed-avatar"
        />
        <div className="feed-header-info">
          <span className="feed-posted-by">
            @{combinedFeed[currentIndex].username}
          </span>
          {currentIndex === 0 && (
            <span className="feed-your-entry-badge">Your Entry</span>
          )}
        </div>
      </div>

      {/* Song & Artist */}
      <div className="feed-fields">
        <div className="feed-field-row">
          <label className="feed-field-label">Song:</label>
          <input
            type="text"
            readOnly
            value={`[ ${combinedFeed[currentIndex].song_name} ]`}
            className="feed-field-input"
          />
        </div>
        <div className="feed-field-row">
          <label className="feed-field-label">Artist:</label>
          <input
            type="text"
            readOnly
            value={`[ ${combinedFeed[currentIndex].song_artist} ]`}
            className="feed-field-input"
          />
        </div>
      </div>

      {/* Chatbox */}
      <div className="sunken-panel feed-chatbox">
        {/* Poster's original comment */}
        <div className="chat-message chat-message--poster">
          <span className="chat-username">@{user?.username}:</span>
          <span className="chat-text">
            {combinedFeed[currentIndex].comment}
          </span>
        </div>

        {/* Subsequent comments */}
        {comments.map((c, i) => (
          <div
            key={i}
            className={`chat-message ${i % 2 === 0 ? "chat-message--even" : ""}`}
          >
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
