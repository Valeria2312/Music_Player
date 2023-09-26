//Реализация плеера без библиотеки
import {data} from "./data.js";
import {roundingUpTime} from "./utils.js";
localStorage.setItem('AudioData', JSON.stringify(data));
const savedAudios = JSON.parse(localStorage.getItem('AudioData'));
const current = document.querySelector(".current"),
    audiolList = document.querySelector(".items");
let audios = [],
    Items = [],
    currentAudio = null,
    buttonPlay = null,
    playing = false,
    volume = 0.5;

if (savedAudios) {
    Items = savedAudios;
} else {
    Items = [];
}

renderAudio()

function renderAudio() {
    Items.forEach((item) => {
        const audio = new Audio(`../../audio/${item.link}`);
        audio.addEventListener("loadeddata", () => {
            const newItem = { ...item, duration: audio.duration, audio };
            audios.push(newItem)
            loadAudioList(newItem);
        })
    })
}
const handleAudioPlay = () =>  {
    const { audio } = currentAudio;
    !playing ? audio.play() : audio.pause();
    playing = !playing;
    console.log(playing)
    buttonPlay.classList.toggle("playing", playing);
}
const pauseCurrentAudio = () => {
    if(!currentAudio) return;
    const { audio } = currentAudio;
    audio.pause();
    audio.cerrenttime = 0;
    playing = false;
    buttonPlay.classList.toggle("playing", playing)
}
const handleAudioNext = () => {
    const contentIndex = document.querySelector(`[data-id="${currentAudio.id}"]`);
    const nextIndex = contentIndex.nextSibling?.dataset;
    const firstIndex = audios[0].id
    const itemId = nextIndex?.id || firstIndex;
    if (!itemId) return;
    setCurrentItem(itemId);
}
const handleAudioPrev = () => {
    const contentIndex = document.querySelector(`[data-id="${currentAudio.id}"]`);
    const prevIndex = contentIndex.previousSibling?.dataset;
    const lastIndex = audios[audios.length - 1].id;
    const itemId = prevIndex?.id || lastIndex;
    if (!itemId) return;
    setCurrentItem(itemId);
}
function handlePlay() {
    const play = document.querySelector(".controls-play");
    const next = document.querySelector(".controls-next");
    const prev = document.querySelector(".controls-prev");
    buttonPlay = play;
    play.addEventListener("click", handleAudioPlay);
    next.addEventListener("click", handleAudioNext);
    prev.addEventListener("click", handleAudioPrev);
}

const togglePlaying = () => {
    const { audio } = currentAudio;
    playing = !playing;
    playing ? audio.play() : audio.pause();
    buttonPlay.classList.toggle("playing", playing);
}
function loadAudioList(item) {
    audiolList.innerHTML += renderItemAudio(item)
}
function renderItemAudio({ id, link, genre, track, group, duration }) {
    const [image] = link.split(".");
    return `<div class="item" data-id="${id}">
            <div
              class="item-image"
              style="background-image: url(./assets/img/${image}.jpeg)"></div>
            <div class="item-titles">
              <h2 class="item-group">${group}</h2>
              <h3 class="item-track">${track}</h3>
            </div>
            <p class="item-duration">${roundingUpTime(duration)}</p>
            <p class="item-genre">${genre}</p>
            <button class="item-play">
            <img src="./assets/img/svg/play.png" alt="play">
            </button>
          </div>`;
}

function renderCurrentAudio({ link, track, year, group, duration }) {
    const [image] = link.split(".");
    return `<div
            class="current-image"
            style="background-image: url(./assets/img/${image}.jpeg)"></div>
          <div class="current-info">
            <div class="current-info__top">
              <div class="current-info__titles">
                <h2 class="current-info__group">${group}</h2>
                <h3 class="current-info__track">${track}</h3>
              </div>
            </div>
             <div class="volume">
                <input min="0" max="1" step="0.1" type="range" name="volume" value="0.5" class="controls-volume"/>
             </div>
            <div class="controls">
              <div class="controls-buttons">
                <button class="controls-button controls-prev">
                <img src="./assets/img/svg/rewind.png" alt="prev">
                </button>

                <button class="controls-button controls-play">
                <img class="icon-play" src="./assets/img/svg/play.png" alt="play">
                <img class="icon-pause" src="./assets/img/svg/pause.png" alt="pause">            
                </button>

                <button class="controls-button controls-next">
                <img src="./assets/img/svg/fast-forward.png" alt="next">
                </button>
              </div>
              <div id="waveform">
                </div>
              <div class="controls-progress">
                <div class="progress">
                  <div class="progress-current"></div>
                </div>

                <div class="timeline">
                  <span class="timeline-start">00:00</span>
                  <span class="timeline-end">${roundingUpTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>`;
}

const setCurrentItem = (id) => {
    const audio = audios.find((item) => item.id === Number(id));
    if (audio) {
        pauseCurrentAudio();
        current.innerHTML = renderCurrentAudio(audio);
        currentAudio = audio;
        currentAudio.audio.volume = volume;
        handlePlay();
        audioUpdateProgress(currentAudio)
        setTimeout(() => {
            togglePlaying();
        }, 10)
    }
}

const changeAudioList = ({target}) => {
    const item = target.closest(".item");
    if (item) {
        const id = item.dataset.id;
        setCurrentItem(id)
    } return
}
const setProgress = (e) => {
    const bar = e.currentTarget
    const width = bar.clientWidth;
    const clickX = e.offsetX;
    const duration = currentAudio.audio.duration;
    currentAudio.audio.currentTime = (clickX / width) * duration;
}
function audioUpdateProgress(currentAudio) {
    const progress = document.querySelector(".progress-current");
    const timeline = document.querySelector(".timeline-start");
    const controlsProgress = document.querySelector(".controls-progress");
    const controlsVolume = document.querySelector(".controls-volume");
    controlsProgress.addEventListener("click", setProgress)
    currentAudio.audio.addEventListener("timeupdate", ({ target }) => {
        const { currentTime } = target;
        const width = (currentTime * 100) / currentAudio.duration;
        timeline.innerHTML = roundingUpTime(currentTime);
        progress.style.width = `${width}%`;
    });
    currentAudio.audio.addEventListener("ended", ({target}) => {
        target.cerrenttime = 0;
        progress.style.width = `0%`;
        handleAudioNext();
    });

    controlsVolume.addEventListener("change", changeVolume)
}
const changeVolume = ({target}) => {
    volume = target.value;
    if(!currentAudio) return;
    currentAudio.audio.volume = volume;
}

audiolList.addEventListener("click", changeAudioList)
