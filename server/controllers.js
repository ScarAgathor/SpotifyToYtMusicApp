import db from './firebaseConfig.js'
import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore'

export async function checkForToken(fieldName) {
    // const { userId } = req.params;  //figure this out
   
    try {
        const userDocRef = doc(db, 'USERS', 'User1'); //I need to make a way for user id to be dynamic
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const token = userData[fieldName];
            if (token !== '') {
                return token;
            }
        } else {
            console.error('No such user doc') // might make this create a user doc
        }
    } catch (error) {
        console.error(error)
    }
};


export async function updateUserField (fieldName, fieldValue) {
    try {
        const userDocRef = doc(db, "USERS", 'User1');

        await updateDoc(userDocRef, {
            [fieldName]: fieldValue
        });

    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
};

export async function setUserField (fieldName, fieldValue) {
    try {
        const userDocRef = doc(db, "USERS", 'User1');

        await setDoc(userDocRef, {
            [fieldName]: fieldValue
        });

    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
};

export async function searchYoutubeVideo(accessToken, query) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=1`;
    
    const response = await fetch(searchUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    });
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId;  // Return the first video's ID
    } else {
        console.error('No video found for query:', query);
        return null;
    }
}

export async function createYoutubePlaylist(accessToken, playlistTitle) {
    const url = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status';
    
    const body = {
        snippet: {
            title: playlistTitle,
        },
        status: {
            privacyStatus: 'public'
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    
    const data = await response.json();

    if (!response.ok) {
        console.error('Error creating playlist:', data);
        throw new Error(`Error: ${data.error.message}`);
    }
    return data.id;
}

export async function addSongToPlaylist(accessToken, playlistId, videoId) {
    const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet';

    const body = {
        snippet: {
            playlistId: playlistId, 
            resourceId: {
                kind: "youtube#video",
                videoId: videoId
            }
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return data;
}