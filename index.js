document.addEventListener('DOMContentLoaded', function() {
    const moodButtons = document.querySelectorAll('.mood-button');
    const buttonsContainer = document.querySelector('.mood-buttons');
    const nextButton = document.querySelector('#nextButton');
    const previousButton = document.querySelector('#previousButton');
    const pauseButton = document.querySelector('#pauseButton');
    const timerDisplay = document.querySelector('#timer');
    const backgroundImage = document.querySelector('.background-image');
    const moodText = document.querySelector('.adlam-display-regular');

    let audio;
    let timerInterval;
    let playedSongs = {};

    // Initially hide the controls
    nextButton.style.display = 'none';
    previousButton.style.display = 'none';
    pauseButton.style.display = 'none';
    timerDisplay.style.display = 'none';

    // Songs for each mood with their associated background images
    const moodSongs = {
        sad: [{ src: 's3.mp3', background: 'i3.jpg' }, { src: 's6.mp3', background: 'i6.jpg' }, { src: 's7.mp3', background: 'i7.jpg' }],
        romantic: [{ src: 's1.mp3', background: 'i1.jpg' }, { src: 's2.mp3', background: 'i2.jpg' }, { src: 's9.mp3', background: 'i9.jpg' }],
        lateNight: [{ src: 's4.mp3', background: 'i4.jpg' }, { src: 's5.mp3', background: 'i5.jpg' }, { src: 's8.mp3', background: 'i8.jpg' }]
    };

    // Function to play a random song from the given array without repeating until all songs have been played
    function playRandomSongWithoutRepeats(songs) {
        clearInterval(timerInterval);

        if (!playedSongs[songs]) {
            playedSongs[songs] = [];
        }

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (playedSongs[songs].includes(randomIndex));

        playedSongs[songs].push(randomIndex);

        if (playedSongs[songs].length === songs.length) {
            playedSongs[songs] = [];
        }

        playSong(songs[randomIndex]);
    }

    // Function to play a specific song
    function playSong(song) {
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'audio';
            document.body.appendChild(audio);
        }
        audio.src = song.src;
        audio.play();
        backgroundImage.style.backgroundImage = `url('${song.background}')`;
        showControls();
        buttonsContainer.style.display = 'none';
        moodText.style.display = 'none'; // Hide the "What's the Mood" text
        audio.addEventListener('loadedmetadata', function() {
            updateTimerDisplay(audio.duration);
        });
        audio.addEventListener('ended', () => {
            buttonsContainer.style.display = 'flex';
            nextSong(moodSongs[getSelectedMood()]);
        });
    }

    function showControls() {
        pauseButton.style.display = 'block';
        nextButton.style.display = 'block';
        previousButton.style.display = 'block';
        timerDisplay.style.display = 'block';
    }

    function updateTimerDisplay(duration) {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isNaN(duration) && isFinite(duration)) {
                const currentTime = audio.currentTime;
                const remainingTime = duration - currentTime;
                timerDisplay.textContent = formatTime(remainingTime);
                if (remainingTime <= 0) {
                    clearInterval(timerInterval);
                    timerDisplay.textContent = '0:00';
                }
            } else {
                timerDisplay.textContent = '0:00';
            }
        }, 1000);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function nextSong(songs) {
        if (!audio.paused) {
            audio.pause();
        }
        clearInterval(timerInterval);

        if (playedSongs[songs].length === songs.length) {
            playedSongs[songs] = [];
        }

        buttonsContainer.style.display = 'flex';
        playRandomSongWithoutRepeats(songs);
    }

    function previousSong(songs) {
        if (!audio.paused) {
            audio.pause();
        }
        let currentIndex = playedSongs[songs].pop();

        if (playedSongs[songs].length > 0) {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = songs.length - 1;
            }
        } else {
            currentIndex = songs.length - 1;
        }

        clearInterval(timerInterval);

        if (playedSongs[songs].length === songs.length) {
            playedSongs[songs] = [];
        }

        playSong(songs[currentIndex]);
        updateTimerDisplay(audio.duration);
    }

    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            moodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const mood = this.getAttribute('data-mood');
            const songs = moodSongs[mood];
            if (songs) {
                playRandomSongWithoutRepeats(songs);
                buttonsContainer.style.display = 'none';
                showControls();
            } else {
                console.error('No songs found for the selected mood');
            }
        });
    });

    pauseButton.addEventListener('click', function() {
        if (!audio.paused) {
            audio.pause();
            pauseButton.textContent = 'Play';
        } else {
            audio.play();
            pauseButton.textContent = 'Pause';
        }
    });

    nextButton.addEventListener('click', function() {
        const mood = getSelectedMood();
        if (mood) {
            const songs = moodSongs[mood];
            nextSong(songs);
        } else {
            console.error('No mood selected');
        }
    });

    previousButton.addEventListener('click', function() {
        const mood = getSelectedMood();
        if (mood) {
            const songs = moodSongs[mood];
            previousSong(songs);
        } else {
            console.error('No mood selected');
        }
    });

    function getSelectedMood() {
        const activeButton = document.querySelector('.mood-button.active');
        return activeButton ? activeButton.getAttribute('data-mood') : null;
    }
});