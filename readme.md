Process for Building Spotify To YT MUSIC APP


designing UI
1. I added form validation
2. Obtain playlist id from a submitted plalist link
3. I seperated all my important keys, secrets, etc in a .env file
4. I also created a seperate router file to handle my methods so that the main server file could be more focused on configuration
5. design UI working process, like certain buttons shud only be availbale after a certain action has taken place


Final Documentation

UI design

Programmatic Flow

User enters a playlist url
validate url
send a req with params: userid, playlistId, spotifytoken - fieldName
check if user has a document in firestore and if they have a spotify token
if no, send them to get one and then update their document
then return them back to page and resubmit their form
if yes, return the playlist
and display it


I then give user option to create the playlist in yt
I check if user has given me authorization to manage yt playlist data
if, yes, create playlist with the correct name and all the songs
if no, obtain access toekn from user
Display new yt playlist to user (might redirect them to youtube)

Repeat process

future features
Two way playlist functionality
Ability to change playlist name before sending it to either yt or sotify
Ability to filter certain songs out of a playlist before creating it intheir desired platform
Abiity to create mulitple playlists from a submitted user playlist
Ability to sort sonfgs based on various criteria