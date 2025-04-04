

const filmCardContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
let counter = document.getElementById('counter');
const showSelector = document.getElementById('showSelector');
const episodeSelector = document.getElementById('episodeSelector');
const showsView = document.getElementById("showsView");
const backToShowsBtn = document.getElementById("backToShowsBtn");
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
//clickable title to redirect it to the episodes and replace value of select a show and select an episode
      const titleElement = document.createElement("p");
      titleElement.textContent =`${Show.name}`;
      titleElement.classList.add('clickable-title');
      titleElement.style.cursor = "pointer";
      titleElement.style.color = 'blue';
      titleElement.addEventListener("click",()=>{
        showSelector.value = Show.id;
        fetchEpisodes(Show.id);
        episodeSelector.innerHTML='<option value="">Select an Episode</option>';
        //showsView.classList.add('hidden'); //this hide the show list view
        backToShowsBtn.classList.remove('hidden');
      if (!backToShowsBtn.classList.contains("hidden")) {
        searchBox.placeholder = `Search in ${Show.name}`;
      }
      
      });
      filmCard.appendChild(titleElement);
//summary note
      const maxSummaryLength = 150;
      const summaryElement = document.createElement("p");
      const cleanSummary = (Show.summary || "No summary available.").replace(/<[^>]*>/g,"");
      const shortSummary = cleanSummary.length > maxSummaryLength  ? cleanSummary.slice(0, maxSummaryLength) + "..."  : cleanSummary;
      summaryElement.textContent = shortSummary;
      filmCard.appendChild(summaryElement);
      const summaryWrapper = document.createElement("div");
      summaryWrapper.classList.add("summary-wrapper");
      summaryElement.classList.add("summary-text");
      summaryWrapper.appendChild(summaryElement);

      if (cleanSummary.length > maxSummaryLength) {
        const seeMoreBtn = document.createElement("button");
        seeMoreBtn.textContent = "See More";
        seeMoreBtn.classList.add("see-more-btn");

        seeMoreBtn.addEventListener("click", () => {
          const isShort = summaryElement.textContent === shortSummary;
          summaryElement.textContent = isShort ? cleanSummary : shortSummary;
          seeMoreBtn.textContent = isShort ? "See Less" : "See More";
        });
        summaryWrapper.appendChild(seeMoreBtn);


      }
       filmCard.appendChild(summaryWrapper);
      
      const generesElement = document.createElement("p");
      generesElement.textContent = `Genre: ${Show.genres}`;
      filmCard.appendChild(generesElement);
      const statusElement = document.createElement("p");
      statusElement.textContent = `Status: ${Show.status}`;
      filmCard.appendChild(statusElement);
      const ratingElement = document.createElement("p");
      ratingElement.textContent = `Rating: ${Show.rating.average}`;
      filmCard.appendChild(ratingElement);
      const runtimeElement = document.createElement("p");
      runtimeElement.textContent = `Run Time: ${Show.runtime}`;
      filmCard.appendChild(runtimeElement);


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
//backtoshow eventlistner
backToShowsBtn.addEventListener('click', () =>{
     showSelector.value = "";
     episodeSelector.innerHTML = '<option value="">Select an Episode</option>';
     searchBox.value = "";
     cache.searchTerm = "";
     showsView.classList.remove("hidden");
     backToShowsBtn.classList.add("hidden");
     displayOnLoad(cache.shows);
    if (backToShowsBtn.classList.contains("hidden")) {
        searchBox.placeholder = `Search the Movie`;
    }
});
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
    const showId = showSelector.value;
    const episodes = cache.episodes[showId];
    if (!episodes || !Array.isArray(episodes)) {
        console.error("No episodes in cache for show ID:", showId);
        return;
    }
    const selectedEpisode = episodes.find(episode => episode.id === parseInt(episodeId));
    if(!selectedEpisode){
        console.error("could not find episode with ID:", episodeId);
        return;
    }
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


// Function to filter episodes based on search term
function filterEpisodes(episodes, searchTerm) {
    return episodes.filter(episode => episode.name.toLowerCase().includes(searchTerm.toLowerCase()));
}

// Event listener for search input
function searchRes(event) {
    const searchTerm = event.target.value.toLowerCase();
    cache.searchTerm = searchTerm;
     if(!showSelector.value){ //if no show is selected, search among the shows
        const filteredShows = cache.shows.filter((show) =>{
            const nameMatch = show.name.toLowerCase().includes(searchTerm);
            const genreMatch = show.genres.join(', ').toLowerCase().includes(searchTerm);
            const summaryMatch = (show.summary || "")
              .replace(/<[^>]*>/g, "")
              .toLowerCase()
              .includes(searchTerm);
            return nameMatch || genreMatch || summaryMatch;

        });
        counter.textContent = `Results: ${filteredShows.length} Shows found`;
        displayOnLoad(filteredShows);
        return;
     }
     const theSelectedShow = showSelector.value;
     const episodes = cache.episodes[theSelectedShow];
     if(episodes && Array.isArray(episodes)){
        const filteredEpisodes = episodes.filter((episode)=>{
            const nameMatch = episode.name.toLowerCase().includes(searchTerm);
            const summaryMatch = (episode.summary || "")
              .replace(/<[^>]*>/g, "")
              .toLowerCase()
              .includes(searchTerm);
            return nameMatch || summaryMatch;
        });
        counter.textContent=`Result: ${filteredEpisodes.length} episodes found`;
        displayAllEpisodes(filteredEpisodes);

     }
  
      
    }

searchBox.addEventListener("input", searchRes);

// Fetch the shows when the page loads
fetchShows();
