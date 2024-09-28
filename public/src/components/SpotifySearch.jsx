import { useState } from "react"
import '../styles/SpotifySearch.module.css'

function SpotifySearch({fetchPlaylistData}) {
    const [playlistLink, setPlaylistLink] = useState('')

    function handleSumbit(e) {
        e.preventDefault()
        const input = e.target.firstElementChild
        if(input.value.length != 0) { 
            const playlistId = input.value.slice(34, 56) //make this a better regex check
            fetchPlaylistData(playlistId)
        }  
    }

    return (
        <div>
            <h1>Welcome, Input a spotify playlist Link to Continue</h1>
            <form method="get" onSubmit={handleSumbit}>
                <input type="text" placeholder="Enter Spotify Link" value={playlistLink} onChange={e => setPlaylistLink(e.target.value)} />
                <button type="submit">Submit Playlist Link</button>
            </form>
        </div>
    )
}

export default SpotifySearch