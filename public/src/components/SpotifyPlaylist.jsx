import SpotifySong from "./SpotifySong"

function SpotifyPlaylist({playlistData}) {

    function createPlaylist() {
        const playlistName = playlistData.playlistName
        const spotifyTracks = playlistData.allSongs.map((song) => ({
            songName: song.track.name,
            artists: song.track.artists.map((artist) => ({
                name: artist.name 
            })),
        }));

        fetch(`http://localhost:5000/youtube/create-playlist/${encodeURIComponent(playlistName)}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ spotifyTracks })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = 'http://localhost:5000/youtube/login';
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
        })
    }

    return(<>
        <div>
            <h2>{playlistData.playlistName}</h2>
            <button onClick={createPlaylist}>Send to Youtube Music</button>
        </div>
        
        <div>
            {playlistData.allSongs.map((song, index) => (
                <SpotifySong key={index} song={song}/>
            ))}
        </div>  
    </>)
}

export default SpotifyPlaylist