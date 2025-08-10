const API_KEY = "6443b197be374906b5d8e7ca0d10e64e";
const url = "https://newsapi.org/v2/everything?q=";
const conName = document.getElementById("conName");
const flag=document.getElementById("flag");


window.addEventListener('load', () => fetchNews("world"));


async function fetchNews(query, country) {
    try {
        // Provide default query if none specified
        if (!query || query === null || query === undefined) {
            query = "world";
        }

        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        const data = await res.json();

        // Check if the API response is successful
        if (data.status === "error") {
            console.error("API Error:", data.message);
            showErrorMessage("Failed to fetch news. Please try again later.");
            return;
        }

        if (country != null && country != undefined) {
            country = country.toUpperCase();
            flag.src=`https://flagsapi.com/${country}/flat/32.png`;
        }
        if (query == null || query == undefined) {
            conName.innerText = "World";
        }
        else{
            conName.innerText = query;
        }
        if(c>0)
        {
            conName.innerText="World";
            flag.src="world.png";
        }

        // Check if articles exist before binding
        if (data.articles && Array.isArray(data.articles)) {
            bindData(data.articles);
        } else {
            console.error("No articles found in response:", data);
            showErrorMessage("No articles found. Please try a different search term.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        showErrorMessage("Failed to fetch news. Please check your internet connection.");
    }
}
function bindData(articles) {
    const cardcontainer = document.getElementById('cards-container');
    const newsCardTemplate = document.getElementById('template-news-card');
    cardcontainer.innerHTML = '';

    // Check if articles is valid and not empty
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        showErrorMessage("No articles available to display.");
        return;
    }

    articles.forEach(article => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardcontainer.appendChild(cardClone);
    })
}

function showErrorMessage(message) {
    const cardcontainer = document.getElementById('cards-container');
    cardcontainer.innerHTML = `
        <div class="error-message" style="
            text-align: center;
            padding: 2rem;
            color: #666;
            font-size: 1.1rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 2rem 0;
        ">
            <h3 style="color: #dc3545; margin-bottom: 1rem;">⚠️ ${message}</h3>
            <p>Please try refreshing the page or searching for different topics.</p>
        </div>
    `;
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector('#news-img');
    const newsTitle = cardClone.querySelector('#news-title');
    const newsSource = cardClone.querySelector('#news-source');
    const newsDesc = cardClone.querySelector('#news-desc');


    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;


    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta"
    })
    newsSource.innerHTML = `${article.source.name} ▪️ ${date}`;

    cardClone.firstElementChild.addEventListener('click', () => {
        window.open(article.url, "_blank");
    })
}
let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove('active');
    curSelectedNav = navItem;
    curSelectedNav.classList.add('active');
}
let c=0;
const searchButton = document.getElementById("searchButton");
const searchText = document.getElementById('search-text');
searchButton.addEventListener('click', () => {
    c++;
    const query = searchText.value.trim();
    if (!query) {
        alert("Please enter a search term");
        return;
    }
    fetchNews(query,"");
    curSelectedNav?.classList.remove('active');
    curSelectedNav = null;
})

// Add Enter key support for search
searchText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
})

function reload() {
    window.location.reload();
}
