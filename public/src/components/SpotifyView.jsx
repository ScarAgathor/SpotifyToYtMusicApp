import { useState } from "react";
import SpotifySearch from "./SpotifySearch"
import SpotifyPlaylist from "./SpotifyPlaylist"

function SpotifyView(){
    const [playlistData, setPlaylistData] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    async function fetchPlaylistData(id) {
        fetch(`http://localhost:5000/spotify/playlist/${id}`, {
            method: 'GET',
            credentials: "include"
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = 'http://localhost:5000/spotify/login';
            }
            return response.json();
        })
        .then(playlistData => {
            setPlaylistData(playlistData)
            setIsVisible(true)
        })
        .catch(err => {
            console.error('Error fetching playlist:', err);
        });
    }

    return (<>
        <SpotifySearch fetchPlaylistData={fetchPlaylistData}/>
        {isVisible && <SpotifyPlaylist  playlistData={playlistData}  />}
    </>)
}

export default SpotifyView