

const filmCardContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
let counter = document.getElementById('counter');

const cache = {
    shows: null,
    episodes: {},
    searchTerm: ""
};

const showSelector = document.getElementById('showSelector');
const episodeSelector = document.getElementById('episodeSelector');

// Fetch all shows and populate the dropdown
async function fetchShows() {
    try {
        if (cache.shows) {
            populateShowSelector(cache.shows);
            return;
        }
        const response = await fetch('https://api.tvmaze.com/shows');
        const shows = await response.json();
    
        const sortedShows = shows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    
        cache.shows = sortedShows;
    
        populateShowSelector(sortedShows);
    } catch (error) {
        displayErrorMessage()
    }
}

// Populate the show selector dropdown
function populateShowSelector(shows) {
    showSelector.innerHTML = '<option value="">Select a Show</option>';
    shows.forEach(show => {
        const option = document.createElement('option');
        option.value = show.id;
        option.textContent = show.name;
        showSelector.appendChild(option);
    });
}

// Fetch episodes for the selected show
async function fetchEpisodes(showId) {
    if (cache.episodes[showId] && Array.isArray(cache.episodes[showId])) {
        populateEpisodeSelector(cache.episodes[showId]);
        displayAllEpisodes(cache.episodes[showId], showId); // Show all episodes when available in cache
        return;
    }

    try {
        const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
        if (!response.ok) {
            throw new Error(`Failed to fetch episodes for show ID ${showId}, status: ${response.status}`);
        }

        const episodes = await response.json();

        if (!Array.isArray(episodes)) {
            console.error('Fetched episodes are not an array.');
            cache.episodes[showId] = [];
        } else {
            cache.episodes[showId] = episodes;
        }

        populateEpisodeSelector(episodes);
        displayAllEpisodes(episodes, showId); // Display all episodes on first fetch
    } catch (error) {
        console.error("Error fetching episodes:", error);
        displayErrorMessage()
    }
}

// Populate the episode selector dropdown
function populateEpisodeSelector(episodes) {
    episodeSelector.innerHTML = '<option value="">Select an Episode</option>';
    episodes.forEach(episode => {
        const option = document.createElement('option');
        option.value = episode.id;
        option.textContent = `${episode.name} (S${episode.season}E${episode.number})`;
        episodeSelector.appendChild(option);
    });
}

// Display all episodes when a show is selected
function displayAllEpisodes(episodes, showId) {
    filmCardContainer.innerHTML = '';
    counter.textContent = `Results: ${episodes.length} episodes found`;

    episodes.forEach((episode) => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('film-card');
        filmCard.dataset.episodeId = episode.id;

        const bannerImg = document.createElement('img');
        bannerImg.src = episode.image ? episode.image.medium : 'default-image.jpg';
        bannerImg.alt = `Banner image for ${episode.name}`;
        filmCard.appendChild(bannerImg);

        const titleElement = document.createElement('h3');
        titleElement.textContent = `${episode.name} (S${episode.season}E${episode.number})`;
        filmCard.appendChild(titleElement);

        const summaryElement = document.createElement('p');
        summaryElement.textContent = episode.summary ? episode.summary.replace(/<[^>]*>/g, '') : 'No summary available for this episode.';
        filmCard.appendChild(summaryElement);

        const linkElement = document.createElement('a');
        linkElement.href = episode.url;
        linkElement.target = "_blank";
        linkElement.textContent = "View on TVMaze";
        linkElement.classList.add('redirect');
        filmCard.appendChild(linkElement);

        filmCardContainer.appendChild(filmCard);
    });
}

// Event listener for show selection
showSelector.addEventListener('change', (event) => {
    const selectedShowId = event.target.value;
    if (selectedShowId) {
        fetchEpisodes(selectedShowId);
    } else {
        episodeSelector.innerHTML = '<option value="">Select an Episode</option>';
        filmCardContainer.innerHTML = '';
    }
});

// Add an event listener for episode selection
episodeSelector.addEventListener('change', (event) => {
    const selectedEpisodeId = event.target.value;
    if (selectedEpisodeId) {
        displayEpisodeDetails(selectedEpisodeId);
    } else {
        const selectedShowId = showSelector.value;
        if (selectedShowId) {
            displayAllEpisodes(cache.episodes[selectedShowId], selectedShowId);
        }
    }
});

// Display details of a specific episode when selected
function displayEpisodeDetails(episodeId) {
    const selectedEpisode = cache.episodes[showSelector.value].find(episode => episode.id === parseInt(episodeId));
    if (selectedEpisode) {

        filmCardContainer.innerHTML = '';

        const filmCard = document.createElement('div');
        filmCard.classList.add('film-card');

        const bannerImg = document.createElement('img');
        bannerImg.src = selectedEpisode.image ? selectedEpisode.image.medium : 'default-image.jpg';
        bannerImg.alt = `Banner image for ${selectedEpisode.name}`;
        filmCard.appendChild(bannerImg);

        const titleElement = document.createElement('h3');
        titleElement.textContent = `${selectedEpisode.name} (S${selectedEpisode.season}E${selectedEpisode.number})`;
        filmCard.appendChild(titleElement);

        const summaryElement = document.createElement('p');
        summaryElement.textContent = selectedEpisode.summary ? selectedEpisode.summary.replace(/<[^>]*>/g, '') : 'No summary available for this episode.';
        filmCard.appendChild(summaryElement);

        const linkElement = document.createElement('a');
        linkElement.href = selectedEpisode.url;
        linkElement.target = "_blank";
        linkElement.textContent = "View on TVMaze";
        linkElement.classList.add('redirect');
        filmCard.appendChild(linkElement);

        filmCardContainer.appendChild(filmCard);
    }
}

// Function to filter episodes based on search term
function filterEpisodes(episodes, searchTerm) {
    return episodes.filter(episode => episode.name.toLowerCase().includes(searchTerm.toLowerCase()));
}

// Event listener for search input
function searchRes(event) {
    cache.searchTerm = event.target.value;
    const selectedShowId = showSelector.value;

    if (selectedShowId && cache.episodes[selectedShowId]) {
        const filteredEpisodes = filterEpisodes(cache.episodes[selectedShowId], cache.searchTerm);
        counter.textContent = `Results: ${filteredEpisodes.length} episodes found`;
        displayAllEpisodes(filteredEpisodes, selectedShowId);
    }
}

searchBox.addEventListener("input", searchRes);


function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block'; // Show the error message
}

// Fetch the shows when the page loads
fetchShows();
