//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  for(let episode of episodeList){
    let seasonNum = String(episode.season).padStart(2, "0");
    let episodeNum = String(episode.number).padStart(2, "0");
    const card = document.createElement("section"); //i created a card section.
    const movieTitle = document.createElement("h1");
    const movieImage = document.createElement("img");
    const movieSummary = document.createElement("p");
    document.getElementById("root").append(card);
    movieTitle.textContent = `${episode.name} - S${seasonNum}E${episodeNum}`;
    card.append(movieTitle);
    movieImage.src = episode.image.medium;
    movieImage.alt = "logo of movie";
    card.append(movieImage);
    movieSummary.innerHTML = episode.summary; //inner html is used incase of html tags inn the summary.
    card.append(movieSummary);
  }
  
  
}
window.onload = setup;
