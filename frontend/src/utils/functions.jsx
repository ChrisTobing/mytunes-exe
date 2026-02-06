export const searchToRows = (songsList) => {
    return songsList.map((song) => (
        <tr key={song.id}>
            <td>🎵</td>
            <td>{song.artist} - {song.name}</td>
        </tr>
    ))
}