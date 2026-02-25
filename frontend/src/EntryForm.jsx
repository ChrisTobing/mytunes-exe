import React from "react";
import "xp.css/dist/XP.css";
import "./App.css";
import placeHolderAlbumArt from "./assets/placeholderMusic.jpg";
import { searchToRows } from "./utils/functions";

function EntryForm({
  inputValue,
  setInputValue,
  handleSearch,
  handleTrackClick,
  selectedTrack,
  comment,
  setComment,
  handleSubmit,
  songsData,
}) {
  return (
    <>
      <h5>
        You haven't entered a song today. Make an entry to see your friends'
        entries!
      </h5>
      <div className="field-row">
        <label htmlFor="text21">Search for:</label>
        <input
          type="text"
          id="text21"
          name="text21"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleSearch}>Find</button>
      </div>
      <div
        className="sunken-panel"
        style={{
          height: "150px",
          marginTop: "10px",
          overflowY: "scroll",
          background: "white",
        }}
      >
        <table style={{ width: "100%" }}>
          <tbody>
            {searchToRows(songsData, handleTrackClick, selectedTrack)}
          </tbody>
        </table>
      </div>
      <div className="selected">
        <label htmlFor="text22">Selected:</label>
        <div className="selected-content">
          <img
            src={selectedTrack ? selectedTrack.albumArt : placeHolderAlbumArt}
            alt="Sample Album Art"
            style={{
              width: "50px",
              height: "50px",
              border: "2px solid gray",
              borderStyle: "double",
            }}
          />
          <div className="selected-content-text">
            <p>
              {selectedTrack
                ? selectedTrack.artist + " - " + selectedTrack.name
                : "No song selected"}
            </p>
            <p>
              Album: {selectedTrack ? selectedTrack.album : "No album selected"}
            </p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <div
        className="field-row-stacked"
        style={{ marginTop: "10px", width: "100%" }}
      >
        <label htmlFor="text23">Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          id="text23"
          name="text23"
          rows="4"
          cols="50"
        />
      </div>
      <div
        className="pos-button-container"
        style={{
          marginTop: "10px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </>
  );
}

export default EntryForm;
