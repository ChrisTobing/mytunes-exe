import { useState } from "react";
import "./CommentItem.css";

function CommentItem({ comment, commentIndex, entryId, currentUser, accessToken, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.text);

  const isOwner = comment.username === currentUser;
  const displayName = comment.username;

  async function handleSave() {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setIsEditing(false);
    await fetch("http://localhost:8000/api/update-comment/", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entry_id: entryId, comment_index: commentIndex, text: trimmed }),
    });
    onUpdate(commentIndex, trimmed);
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    await fetch(`http://localhost:8000/api/entry/${entryId}/comment/${commentIndex}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    onDelete(commentIndex);
  }

  function handleCancel() {
    setEditValue(comment.text);
    setIsEditing(false);
  }

  return (
    <div className="comment-item">
      <span className="comment-author">{isOwner ? `@${currentUser} (you)` : `@${comment.username}`}:&nbsp;</span>

      {isEditing ? (
        <input
          className="comment-edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
          autoFocus
        />
      ) : (
        <span className="comment-text">{comment.text}</span>
      )}

      {isOwner && (
        <span className="comment-actions">
          {isEditing ? (
            <>
              <a className="comment-link" onClick={handleSave}>[Save]</a>
              <a className="comment-link" onClick={handleCancel}>[Cancel]</a>
            </>
          ) : (
            <>
              <a className="comment-link" onClick={() => setIsEditing(true)}>[Edit]</a>
              <a className="comment-link" onClick={handleDelete}>[Delete]</a>
            </>
          )}
        </span>
      )}
    </div>
  );
}

export default CommentItem;
