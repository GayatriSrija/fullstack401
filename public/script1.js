// select required elements
const container = document.querySelector(".container");
const search = document.querySelector(".search-box button");
const movieBox = document.querySelector(".movie-box");
const movieDetails = document.querySelector(".movie-details");
const error404 = document.querySelector(".not-found");

search.addEventListener("click", () => {
    const APIKey = "3daae119";
    const title = document.querySelector(".search-box input").value;

    if (title === "") return;

    fetch(`http://www.omdbapi.com/?t=${title}&apikey=${APIKey}`)
        .then(response => response.json())
        .then(json => {
            if (json.Response === "False") {
                container.style.height = "400px";
                movieBox.style.display = "none";
                movieDetails.style.display = "none";
                error404.style.display = "block";
                error404.classList.add("fadeIn");
                return;
            }

            error404.style.display = "none";
            error404.classList.remove("fadeIn");

            const image = document.querySelector(".movie-box img");
            const titleElem = document.querySelector(".movie-box .title");
            const genre = document.querySelector(".movie-box .genre");
            const rating = document.querySelector(".movie-details .rating-details span");
            const director = document.querySelector(".movie-details .director-details span");
            const plot = document.querySelector(".movie-details .plot-details span");

            image.src = json.Poster;
            titleElem.innerHTML = `${json.Title}`;
            genre.innerHTML = `${json.Genre}`;
            rating.innerHTML = `${json.imdbRating}`;
            director.innerHTML = `${json.Director}`;
            plot.innerHTML = `${json.Plot}`;

            movieBox.style.display = "";
            movieDetails.style.display = "";
            movieBox.classList.add("fadeIn");
            movieDetails.classList.add("fadeIn");
            container.style.height = "590px";

            // Save movie details to the database
            fetch('/save-movie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(json)
            }).then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
        });
});
