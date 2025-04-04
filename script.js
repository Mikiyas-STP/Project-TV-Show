

const filmCardContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
let counter = document.getElementById('counter');
const showSelector = document.getElementById('showSelector');
const episodeSelector = document.getElementById('episodeSelector');
const cache = {
    shows: null,
    episodes: {},
    searchTerm: ""
};
// Fetch all shows and populate the dropdown
async function fetchShows() {
    if (cache.shows) {
        populateShowSelector(cache.shows);
        return;
    }
    const response = await fetch('https://api.tvmaze.com/shows');
    const shows = await response.json();

    const sortedShows = shows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    cache.shows = sortedShows;

    displayOnLoad(cache.shows);
    populateShowSelector(sortedShows);
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
        displayAllEpisodes(cache.episodes[showId]); // Show all episodes when available in cache
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
//function for the displayed first data on load
function displayOnLoad(shows){
    filmCardContainer.innerHTML = "";
    counter.textContent = `Results: ${shows.length} Shows found.`;

    shows.forEach((Show) => {
      const filmCard = document.createElement("div");
      filmCard.classList.add("film-card");
      filmCard.dataset.episodeId = Show.id;

      const bannerImg = document.createElement("img");
      bannerImg.src = Show.image
        ? Show.image.medium
        : "default-image.jpg";
      bannerImg.alt = `Banner image for ${Show.name}`;
      filmCard.appendChild(bannerImg);

      const titleElement = document.createElement("h3");
      titleElement.textContent = `${Show.name} (S${Show.season}E${Show.number})`;
      filmCard.appendChild(titleElement);

      const summaryElement = document.createElement("p");
      summaryElement.textContent = Show.summary
        ? Show.summary.replace(/<[^>]*>/g, "")
        : "No summary available for this episode.";
      filmCard.appendChild(summaryElement);

      const linkElement = document.createElement("a");
      linkElement.href = Show.url;
      linkElement.target = "_blank";
      linkElement.textContent = "View on TVMaze";
      linkElement.classList.add("redirect");
      filmCard.appendChild(linkElement);

      filmCardContainer.appendChild(filmCard);
    });

}
// Display all episodes when a show is selected
function displayAllEpisodes(episodes) {
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
            displayAllEpisodes(cache.episodes[selectedShowId]);
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
    const searchTerm = event.target.value.toLowerCase();
    cache.searchTerm = searchTerm;
     if(!showSelector.value){
        const filteredShows = cache.shows.filter((show) =>
          show.name.toLowerCase().includes(searchTerm)
        );
        counter.textContent = `Results: ${filteredShows.length} Shows found`;
        displayOnLoad(filteredShows);
        return;
     }
     const theSelectedShow = showSelector.value;
     const episodes = cache.episodes[theSelectedShow];
     if(episodes && Array.isArray(episodes)){
        const filteredEpisodes = filterEpisodes(episodes, searchTerm);
        counter.textContent=`Result: ${filteredEpisodes.length} episodes found`;
        displayAllEpisodes(filteredEpisodes);

     }
      
    }

searchBox.addEventListener("input", searchRes);

// Fetch the shows when the page loads
fetchShows();
