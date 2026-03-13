import { useState, useEffect } from "react";
import "xp.css/dist/XP.css";
import "./Feed.css";
import placeholderAlbumArt from "./assets/placeholderMusic.jpg";
import { combineFeed } from "./utils/functions";
import CommentItem from "./CommentItem";
import { API_BASE_URL } from "./config.js";

function Feed({ user, entry, friendEntries, accessToken }) {
  const [feedData, setFeedData] = useState(() => combineFeed(entry, friendEntries));
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const feedLength = feedData.length;

  useEffect(() => {
    if (entry) setFeedData(combineFeed(entry, friendEntries));
  }, [entry, friendEntries]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function setCommentsAt(index, newComments) {
    setFeedData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, comments: newComments } : item))
    );
  }

  async function handleSend() {
    const text = commentInput.trim();
    if (!text) return;
    const response = await fetch(`${API_BASE_URL}/api/add-comment/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry_id: feedData[currentIndex].id,
        username: user.username,
        text: text,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setCommentsAt(currentIndex, data.comments);
    } else {
      console.error("Error:", response.statusText);
      alert(response.statusText);
    }
    setCommentInput("");
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(currentIndex === 0 ? feedLength - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === feedLength - 1 ? 0 : currentIndex + 1);
  };

  function handleUpdate(idx, newText) {
    const updated = feedData[currentIndex].comments.map((c, i) =>
      i === idx ? { ...c, text: newText } : c
    );
    setCommentsAt(currentIndex, updated);
  }

  function handleDelete(idx) {
    const updated = feedData[currentIndex].comments.filter((_, i) => i !== idx);
    setCommentsAt(currentIndex, updated);
  }

  if (!entry || !user || feedData.length === 0) return null;

  return (
    <div className="feed-container">
      {/* Navigation + Album Art */}
      <span className="feed-date-header">{today}</span>
      <div className="feed-nav">
        <button className="feed-nav-btn" onClick={handlePrevious}>
          &lt;
        </button>
        <div className="feed-album-art-wrapper">
          <div className="sunken-panel feed-album-art-panel">
            <img
              src={feedData[currentIndex].song_album_art || placeholderAlbumArt}
              alt="Album Art"
              className="feed-album-art"
            />
          </div>
        </div>
        <button className="feed-nav-btn" onClick={handleNext}>
          &gt;
        </button>
      </div>

      <hr className="feed-divider" />

      {/* Header */}
      <div className="feed-header">
        <img
          src={
            currentIndex === 0
              ? user?.profile_picture_url || placeholderAlbumArt
              : feedData[currentIndex].profile_picture_url || placeholderAlbumArt
          }
          alt="User avatar"
          className="feed-avatar"
        />
        <div className="feed-header-info">
          <span className="feed-posted-by">
            @{feedData[currentIndex].username}
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
            value={`[ ${feedData[currentIndex].song_name} ]`}
            className="feed-field-input"
          />
        </div>
        <div className="feed-field-row">
          <label className="feed-field-label">Artist:</label>
          <input
            type="text"
            readOnly
            value={`[ ${feedData[currentIndex].song_artist} ]`}
            className="feed-field-input"
          />
        </div>
      </div>

      {/* Chatbox */}
      <div className="sunken-panel feed-chatbox">
        {feedData[currentIndex].comments.map((c, i) => (
          <CommentItem
            key={i}
            comment={c}
            commentIndex={i}
            entryId={feedData[currentIndex].id}
            currentUser={user.username}
            accessToken={accessToken}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
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
