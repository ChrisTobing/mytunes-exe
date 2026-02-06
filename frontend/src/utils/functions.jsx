export const searchToRows = (songsList, handleTrackClick, selectedTrack) => {
    return songsList.map((song) => {
        const isSelected = selectedTrack && selectedTrack.id === song.id
        return (
            <tr
                key={song.id}
                onClick={() => handleTrackClick(song.id, song.name, song.artist, song.album, song.albumArt)}
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