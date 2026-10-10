let favorites = [];
let currentFilter = "all";
let allMovies = [];
let currentSearch = "";
let currentSort = "recent";

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("favorites");
    if(saved) {
        favorites = JSON.parse(saved);
    }

    loadMovies();

    const searchInput = document.getElementById("search-input");
    const searchForm = document.querySelector(".search-bar");


    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        currentSearch = searchInput.value.trim();
        renderMovies();
    });

    searchInput.addEventListener("input", () => {
        currentSearch = searchInput.value.trim();
        renderMovies();
    });

    document.querySelector(".btn-all").addEventListener("click", () => {
        currentFilter = "all";
        document.querySelector(".btn-all").classList.add("active");
        document.querySelector(".btn-fav").classList.remove("active");
        renderMovies();
    });

    document.querySelector(".btn-fav").addEventListener("click", () => {
        currentFilter = "fav";
        document.querySelector(".btn-fav").classList.add("active");
        document.querySelector(".btn-all").classList.remove("active");
        renderMovies();
    });

    document.getElementById("sort").addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderMovies();
    });
});

async function loadMovies() {    
    try {
        const answer = await fetch("./movies.json");
        allMovies = await answer.json();
        renderMovies();    
    } catch(error) {
        console.log("Error al cargar los datos", error);
    }
}

function renderMovies() {
    let result = [...allMovies];

    if(currentSearch) {
        result = result.filter(movie =>
            movie.title.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    if(currentFilter === "fav") {
        result = result.filter(movie => favorites.includes(movie.id));
    }

    if(currentSort === "recent") {
        result.sort((a,b) => b.year - a.year);
    } else if(currentSort === "alpha") {
        result.sort((a,b) => a.title.localeCompare(b.title));
    }

    const container = document.querySelector(".movie-section");
    container.innerHTML = "";
    result.forEach(movie => {
        const card = createCard(movie);
        container.appendChild(card);
    });

    document.getElementById("movies-amount").textContent = `${result.length} películas encontradas`;
    updateFavUI();
}

function createCard(movie) {
    const card = document.createElement("article");
    card.classList.add("movie-card");

    const poster = document.createElement("div");
    poster.classList.add("movie-poster");
    // poster.style.backgroundImage = `url(${movie.image})`;
    
    const favStar = document.createElement("button");
    favStar.type = "button";
    favStar.setAttribute("data-id", movie.id);
    favStar.classList.add("fav-star-btn");
    favStar.setAttribute("aria-label", "Marcar como favorita");
    favStar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
    poster.appendChild(favStar);

    const titlePoster = document.createElement("h3");
    titlePoster.textContent = movie.title;
    poster.appendChild(titlePoster);

    const info = document.createElement("div");
    info.classList.add("movie-info");

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const year = document.createElement("p");
    year.textContent = movie.year;

    const genre = document.createElement("p");
    genre.textContent = movie.genre;

    const fbutton = document.createElement("button");
    fbutton.type = "button";
    fbutton.setAttribute("data-id", movie.id);
    fbutton.classList.add("fav-add-btn");
    fbutton.textContent = "Agregar a favoritos";

    info.appendChild(title);
    info.appendChild(year);
    info.appendChild(genre);
    info.appendChild(fbutton);

    card.appendChild(poster);
    card.appendChild(info);

    favStar.addEventListener("click", () => toggleFavorite(movie.id));
    fbutton.addEventListener("click", () => toggleFavorite(movie.id));    

    return card;
}

function updateFavUI() {
    document.getElementById("fav-count").textContent = favorites.length;

    document.querySelectorAll(".fav-star-btn, .fav-add-btn").forEach(btn => {
        const id = parseInt(btn.dataset.id);
        const esFav = favorites.includes(id);

        if(btn.classList.contains("fav-star-btn")) {
            btn.classList.toggle("active", esFav);
        } else {
            btn.textContent = esFav ? "Quitar de Favoritos" : "Agregar a Favoritos";
        }
    });
}

function toggleFavorite(id) {
    if(favorites.includes(id)) {
        favorites = favorites.filter(favID => favID !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderMovies();
}