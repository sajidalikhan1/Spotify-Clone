let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesAndSeconds(seconds) {
  // Ensure the input is a valid number
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format the result as "mm:ss"
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){ 

    currFolder = folder;
    let a = await fetch(`/${folder}/`) //used to fetch the folder
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response; //for response
    let as = div.getElementsByTagName("a")

    songs = []
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    } 

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "" 
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                      <img class="invert" width="34" src="img/music.svg" alt="">
                      <div class="info">
                        <div>${song.replaceAll("%20", "")}</div>
                        <div>Harry</div>
                      </div>
                      <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                      </div></li>`; 
    }

    // Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        
        e.addEventListener("click", element=>{ 
             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()) 
        })
    })
    return songs
}

const playMusic = (track, pause=false)=>{ 
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI( track)
    document.querySelector(".songtime").innerHTML = "00:00 /00:00"


}

// function for display album
async function displayAlbums(){
    let a = await fetch(`/songs/`) 
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0]

            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`) 
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card "> 
            <div class="play"> 
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" class="circular-svg">
                <circle cx="30" cy="30" r="28" fill="#1fdf64"/>
                <g transform="translate(30, 30)">
                    <path d="M5.89062 0.846191C5.53708 2.18919 3.86666 3.13814 0.525743 5.03612C-2.70403 6.87092 -4.31879 7.78837 -5.62017 7.41963C-6.1582 7.26713 -6.64841 6.97757 -7.04376 6.5787C-8 5.6139 -8 3.74262 -8 0C-8 -3.7426 -8 -5.61389 -7.04376 -6.57868C-6.64841 -6.97755 -6.1582 -7.26712 -5.62017 -7.41958C-4.31879 -7.78835 -2.70403 -6.87093 0.525743 -5.03607C3.86666 -3.13803 5.53708 -2.18899 5.89062 -0.845993C6.03648 0.708447 6.03648 1.29155 5.89062 1.84619Z" fill="#000000" stroke-width="0" stroke-linejoin="round"/>
                </g>
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${ item.currentTarget.dataset.folder}`) 
        })
    })
}

async function main(){

    // Get the list of the all songs
     await getSongs("songs/ncs") 
    playMusic(songs[0], true)

    // Display all albums on the page
    displayAlbums()

    // Attach an event listner to play ,next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg" 
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML= `${secondsToMinutesAndSeconds(currentSong.currentTime)} / ${secondsToMinutesAndSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) *100 + "%";
    })

    // Add a event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100 ;
        document.querySelector(".circle").style.left = percent + "%" ;
        currentSong.currentTime = ((currentSong.duration) * percent)/100;
    
    })

    // Add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listner for close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listner to previous 
    previous.addEventListener("click", ()=>{
        console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })

    // Add an event listner to next
    next.addEventListener("click", ()=>{
        currentSong.pause()
        console.log("next clicked")
        
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    // Add an event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to", e.target.value , "/ 100") //it shows volume how much we have
        currentSong.volume = parseInt(e.target.value) / 100  //for changing volume to int

        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
        }
    })

    // Add an event listner to mute track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        // console.log(e.target)
        if(e.target.src.includes( "volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .20;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })
    
}

main()