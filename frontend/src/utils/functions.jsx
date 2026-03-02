export const searchToRows = (songsList, handleTrackClick, selectedTrack) => {
    return songsList.map((song) => {
        const isSelected = selectedTrack && selectedTrack.id === song.id
        return (
            <tr
                key={song.id}
                onClick={() => handleTrackClick(song.id, song.name, song.artist, song.album, song.albumArt, song.previewUrl)}
                style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#166aee' : 'white',
                    color: isSelected ? 'white' : 'black'
                }}
            >
                <td>🎵</td>
                <td>{song.artist} - {song.name}</td>
            </tr>
        )
    })
}

export const combineFeed = (entry, friendEntries) => {
    if (!entry) return [];
    const friendFeedItems = friendEntries
        .filter(f => f.today_entry)
        .map(f => f.today_entry);
    return [entry, ...friendFeedItems];
}