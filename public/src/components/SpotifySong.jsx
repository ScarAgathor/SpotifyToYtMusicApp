
function SpotifySong({song}) {

    return(<>
        Song Name: {song.track.name}
        <div>
            {song.track.artists.map((artist, index) => (
                <p key={index}>Artist: {artist.name}</p>
            ))}
        </div>
    </>)
}

export default SpotifySong