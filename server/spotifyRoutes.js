import { Router } from "express";
import querystring from 'querystring'
import {config} from 'dotenv'
import {checkForToken, updateUserField, setUserField} from "./controllers.js";

config()
const spotifyRouter = Router()
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URL;

spotifyRouter.get('/spotify/playlist/:playlistId', async(req, res) => {
    const playlistId = req.params.playlistId;
    let accessToken = await checkForToken('SpotifyAccessToken')
    if (!accessToken) {
        return res.status(401).json({ message: 'Login required' })
    }
    let initialUrl = `https://api.spotify.com/v1/playlists/${playlistId}?limit=100`

    const response = await fetch(initialUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    const playlistData = await response.json();

    if(playlistData.error) {
        if (playlistData.error.message.includes('token expired')) {
            accessToken = await getNewAccessToken()
        }
    }

    

    // console.log(accessToken)

    async function getTracks(initialUrl, accessToken) {
        let allSongs = []
        let playlistName;
        let nextSongs;

        try {

            const response = await fetch(initialUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            const playlistData = await response.json();


            playlistName = playlistData.name
            allSongs =  allSongs.concat(playlistData.tracks.items)
            nextSongs = playlistData.tracks.next;

            while (nextSongs) {
                const response = await fetch(nextSongs, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const playlistData = await response.json();

                if (playlistData.error) {
                    throw new Error(playlistData.error.message);
                }
                allSongs = allSongs.concat(playlistData.items)
                nextSongs = playlistData.next;
            } 
        }
        catch (error) {
            console.error('Error fetching playlist tracks:', error);
            return res.status(500).json({ error: 'Failed to fetch playlist' });
        }

        return {allSongs, playlistName}
    }
    getTracks(initialUrl, accessToken)
    .then(({allSongs, playlistName}) => {
        res.json({
            playlistName,
            allSongs
        });
    })
    .catch(error => {
        console.error('Error fetching playlist:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch playlist' });
        }
    });
})


spotifyRouter.get('/spotify/login', (req, res) => {
    const scope = 'user-read-private user-read-email';
    const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: 'code',
            client_id: spotifyClientId,
            redirect_uri: spotifyRedirectUri,
            scope: scope
        })
    res.redirect(spotifyAuthUrl)
})

spotifyRouter.get('/spotify/callback', (req, res) => {
    const authCode = req.query.code||null

    if(!authCode) {
        return res.redirect('http://127.0.0.1:5500')
    }

    const authOptions = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64')
        },
        body: new URLSearchParams({
            code: authCode,
            redirect_uri: spotifyRedirectUri,
            grant_type: 'authorization_code'
        }).toString(),
    };
    
    fetch('https://accounts.spotify.com/api/token', authOptions)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            return res.status(400).json(data);
        }
        
        updateUserField("SpotifyAccessToken", data.access_token )
        updateUserField("SpotifyRefreshToken ", data.refresh_token)
        res.redirect('http://localhost:5173')
    })
    .catch(error => {
        console.error('Error fetching Spotify access token:', error);
        res.status(500).send('Error during Spotify authentication');
    });
})

async function getNewAccessToken() {
    const refreshToken = await checkForToken("SpotifyRefreshToken ");


    const url = "https://accounts.spotify.com/api/token";

    const payload = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            // client_id: spotifyClientId
        }),
    }
    fetch(url, payload)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.log('No data found')
        }
        updateUserField("SpotifyAccessToken", data.access_token)


        return data.access_token
    })

}
export default spotifyRouter
