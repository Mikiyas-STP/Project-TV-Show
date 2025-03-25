// Declare episodesData globally
// const endpoint = "https://programming.codeyourfuture.io/dummy-apis/films.json";
let episodesData = [];
const state = {
  films: []
};
function setup() {
  //at the start of the setup i defined loadmsg section to load message set its property to block if it exist
  const loadMsg = document.getElementById("loadingMessage");
  loadMsg.style.display = 'block';
  const fetchAllFilms = async () => {
    //try fetching and if the response is not ok throw an error fetching episodes failed.
    try{
      const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
      if(!response.ok){
      throw new Error('Fetching episodes Failed');
    }
    //if not return the normal condition here
    return await response.json();
  }
  //if their is an error catched throw a new error an error occur when loading data
     catch (error){
    throw new Error('An error occur when loading data');
  }

  };
fetchAllFilms().then((allEpisodeList)=>{
  state.films = allEpisodeList;
  console.log(state.films);
  loadMsg.style.display = 'none';
  //const allEpisodes = getAllEpisodes(); // Fetch all episodes
  if (!Array.isArray(state.films)) {
    console.error("Error: allEpisodes is not an array", state.films);
    return; // Exit if data is invalid
  }
  episodesData = makePageForEpisodes(state.films); // Store the data after rendering

}).catch((error) => {
  //to handle error and notify user
  loadMsg.style.display = 'none';
  const errorMessage = document.getElementById("loadingMessage");
  errorMessage.textContent = error.message;
  errorMessage.style.display = 'block';

});

}

function makePageForEpisodes(episodeList) {
  const episodesData = []; // Store all episodes' data here
  for (let episode of episodeList) {
    let seasonNum = String(episode.season).padStart(2, "0");
    let episodeNum = String(episode.number).padStart(2, "0");
    
    // Create the card section
    const card = document.createElement("section");
    const movieTitle = document.createElement("h1");
    const movieImage = document.createElement("img");
    const movieSummary = document.createElement("p");
    
    // Append elements to the card
    movieTitle.textContent = `${episode.name} - S${seasonNum}E${episodeNum}`;
    card.append(movieTitle);
    
    movieImage.src = episode.image.medium;
    movieImage.alt = "logo of movie";
    card.append(movieImage);
    
    movieSummary.innerHTML = episode.summary; // innerHTML is used to handle HTML tags in the summary
    card.append(movieSummary);

    // Append the card to the root element
    document.getElementById("root").append(card);

    // Store the episode data
    episodesData.push({ title: episode.name, summary: episode.summary, element: card });
  }
  
// create option element for the dropDown.

  episodesData.forEach(episode => {
    const option = document.createElement('option');
    option.value = episode.title;
    option.textContent = episode.title;
    episodeSelector.appendChild(option);
});
  return episodesData;  // Return an array of episode data
}

// ========================SearchBar and DropDown===========================//

const searchBar = document.getElementById('searchBar');
const resultCountElement = document.getElementById("resultCount");

// Search bar event listener
searchBar.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  let visibleCount = 0;

  // Iterate over episodesData
  episodesData.forEach(epi => {
    // Check if the title or summary contains the search value
    const isVisible = epi.title.toLowerCase().includes(value) || 
                      epi.summary.toLowerCase().includes(value);

    // Toggle visibility of the episode card
    epi.element.classList.toggle("hide", !isVisible);

    if (isVisible) {
      visibleCount++;
    }
  });

  // Update result count text
  resultCountElement.textContent = `showing ${visibleCount}/${episodesData.length}`;
});



// Drop down

const episodeSelector = document.getElementById('episodeSelector');
const episodeDetailsElement = document.getElementById('episodeDetails');



// Listen for change event on the episodeSelector
episodeSelector.addEventListener("change", (e) => {
  const selectedTitle = e.target.value;  // Get the selected episode's title


  // filter the episodes based on the selected value
  episodesData.forEach(epi => {
      const isVisible = epi.title.toLowerCase().includes(selectedTitle.toLowerCase()) ||
                        epi.summary.toLowerCase().includes(selectedTitle.toLowerCase());

      // Toggle visibility based on matching search
      if (!selectedTitle) {
          resetToOriginalState()
          return
      }
      else{
        epi.element.classList.toggle("hide", !isVisible);
        episodeDetailsElement.innerHTML = '';
      }
  });
});



function resetToOriginalState() {
  // Show all episodes by removing the 'hide' class
  episodesData.forEach(epi => {
      epi.element.classList.remove("hide");
  });
}
// =================================================================//

window.onload = setup;

