import { Router } from "express";
import querystring from 'querystring'
import {config} from 'dotenv'
import { checkForToken, updateUserField, createYoutubePlaylist, searchYoutubeVideo, addSongToPlaylist } from "./controllers.js";
config()

const youtubeRouter = Router()

const youtubeClientId = process.env.YOUTUBE_CLIENT_ID;
const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET;
const youtubeRedirectUri = process.env.YOUTUBE_REDIRECT_URL;

youtubeRouter.post('/youtube/create-playlist/:name', async (req, res) => {
    const accessToken = await checkForToken('YoutubeToken')

    const playlistName = req.params.name
    const spotifyTracks = req.body.spotifyTracks;

   
    if (!accessToken) {
        return res.status(401).json({ message: 'Login required' })
    }

    try {
        const youtubePlaylistId = await createYoutubePlaylist(accessToken, playlistName);
        for (let track of spotifyTracks) {
            const query = `${track.songName} ${track.artists[0].name}`;
            
            const youtubeVideoId = await searchYoutubeVideo(accessToken, query);            
            if (youtubeVideoId) {
                await addSongToPlaylist(accessToken, youtubePlaylistId, youtubeVideoId);
            }
        }  
    } catch (error) {
        res.status(500).json({ error: 'Failed to create YouTube playlist' });
    }
})

youtubeRouter.get('/youtube/login', (req, res) => {
    const scope = 'https://www.googleapis.com/auth/youtube.force-ssl';
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
        querystring.stringify({
            response_type: 'code',
            client_id: youtubeClientId,
            redirect_uri: youtubeRedirectUri,
            scope: scope,
            access_type: 'online',
            prompt: 'consent'
        })
    res.redirect(authUrl)
})

youtubeRouter.get('/youtube/callback', (req, res) => {    
    const authCode = req.query.code || null
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const tokenData = {
        code: authCode,
        client_id: youtubeClientId,
        client_secret: youtubeClientSecret,
        redirect_uri: youtubeRedirectUri,
        grant_type: 'authorization_code',
    };
    
    fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenData).toString(),
    })
    .then(response => response.json())
    .then(data => {

        updateUserField("YoutubeToken", data.access_token)
        res.redirect('http://localhost:5173')
    })
    .catch(error => {
        console.error('Error fetching YouTube access token:', error);
        res.status(500).send('Error during YouTube authentication');
    });
});

export default youtubeRouter