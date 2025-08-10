// Configuration object for the news app
const CONFIG = {
    // API key from your .env file - for client-side apps, we need to use it directly
    // In production, consider using a backend proxy to hide the API key
    API_KEY: "2f9ae30513c34461a3180a7ecd9dde20",
    BASE_URL: "https://newsapi.org/v2/everything",
    HEADLINES_URL: "https://newsapi.org/v2/top-headlines",
    ARTICLES_PER_PAGE: 20,
    DEFAULT_COUNTRY: "us",
    DEFAULT_QUERY: "technology"
};

// DOM element references - will be initialized after DOM loads
let DOM = {};

// Initialize DOM references
function initializeDOM() {
    DOM = {
        conName: document.getElementById("conName"),
        flag: document.getElementById("flag"),
        cardsContainer: document.getElementById('cards-container'),
        newsCardTemplate: document.getElementById('template-news-card'),
        searchButton: document.getElementById("searchButton"),
        searchText: document.getElementById('search-text'),
        navItems: document.querySelectorAll('.nav-item')
    };

    // Verify all elements are found
    const missingElements = [];
    Object.entries(DOM).forEach(([key, element]) => {
        if (!element || (element.length !== undefined && element.length === 0)) {
            missingElements.push(key);
        }
    });

    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
        Utils.showError(`Missing page elements: ${missingElements.join(', ')}. Please refresh the page.`);
        return false;
    }

    return true;
}


// Utility functions for API calls and error handling
const Utils = {
    // Sanitize input to prevent XSS attacks
    sanitizeInput: (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Show loading state
    showLoading: () => {
        console.log('Utils.showLoading: Showing loading state');
        const container = DOM.cardsContainer || document.getElementById('cards-container');
        if (container) {
            container.innerHTML = '<div class="loading">Loading news articles...</div>';
        }
    },

    // Show error message
    showError: (message) => {
        console.error('Utils.showError:', message);
        const container = DOM.cardsContainer || document.getElementById('cards-container');
        if (container) {
            container.innerHTML = `<div class="error">Error: ${message}</div>`;
        } else {
            // Fallback: show alert if container not found
            alert('Error: ' + message);
        }
    },

    // Validate API response
    validateResponse: (data) => {
        return data && data.status === 'ok' && Array.isArray(data.articles);
    },

    // Format date for display
    formatDate: (dateString) => {
        try {
            return new Date(dateString).toLocaleString("en-US", {
                timeZone: "Asia/Jakarta",
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Unknown date';
        }
    }
};

// Error recovery and retry mechanism
function retryFetch(url, options = {}, maxRetries = 3) {
    return new Promise((resolve, reject) => {
        const attempt = (retryCount) => {
            fetch(url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(resolve)
                .catch(error => {
                    if (retryCount < maxRetries) {
                        console.log(`Retry attempt ${retryCount + 1} for ${url}`);
                        setTimeout(() => attempt(retryCount + 1), 1000 * (retryCount + 1));
                    } else {
                        reject(error);
                    }
                });
        };
        attempt(0);
    });
}

// Application state management
const AppState = {
    currentQuery: null,
    currentCountry: null,
    isLoading: false,
    currentPage: 1,
    totalResults: 0,
    articlesPerPage: 20,
    maxPages: 5,
    allArticles: []
};




async function fetchNews(query = CONFIG.DEFAULT_QUERY, country = null, page = 1) {
    console.log('fetchNews called with:', { query, country, page });

    // Prevent multiple simultaneous requests
    if (AppState.isLoading) {
        console.log('Already loading, skipping request');
        return;
    }

    try {
        AppState.isLoading = true;
        console.log('Starting to fetch news...');
        Utils.showLoading();

        // Sanitize inputs
        query = query ? Utils.sanitizeInput(query.trim()) : CONFIG.DEFAULT_QUERY;
        country = country ? Utils.sanitizeInput(country.trim()) : null;

        // Build API URL with pagination - using working CORS proxy
        let apiUrl;
        const corsProxy = "https://api.allorigins.win/raw?url=";

        if (country) {
            // Use headlines endpoint for country-specific news
            const originalUrl = `${CONFIG.HEADLINES_URL}?country=${country.toLowerCase()}&pageSize=${AppState.articlesPerPage}&page=${page}&apiKey=${CONFIG.API_KEY}`;
            apiUrl = `${corsProxy}${encodeURIComponent(originalUrl)}`;
        } else {
            // Use everything endpoint for search queries
            const originalUrl = `${CONFIG.BASE_URL}?q=${encodeURIComponent(query)}&pageSize=${AppState.articlesPerPage}&page=${page}&sortBy=publishedAt&apiKey=${CONFIG.API_KEY}`;
            apiUrl = `${corsProxy}${encodeURIComponent(originalUrl)}`;
        }

        // Use retry mechanism for better reliability
        const data = await retryFetch(apiUrl);

        // Validate response data
        if (!Utils.validateResponse(data)) {
            throw new Error('Invalid response format from API');
        }

        // Check if we have articles
        if (data.articles.length === 0) {
            if (page === 1) {
                Utils.showError('No articles found for your search.');
                hidePagination();
            } else {
                Utils.showError('No more articles available.');
            }
            return;
        }

        // Update UI state
        updateUIState(query, country);

        // Update app state
        AppState.currentQuery = query;
        AppState.currentCountry = country;
        AppState.currentPage = page;
        AppState.totalResults = data.totalResults || data.articles.length;

        // Bind data to UI
        bindData(data.articles);

        // Update pagination
        updatePagination();

    } catch (error) {
        console.error('Error fetching news:', error);
        Utils.showError('Failed to load news. Please check your internet connection and try again.');
        hidePagination();
    } finally {
        AppState.isLoading = false;
    }
}

function updateUIState(query, country) {
    if (country) {
        // Update for country selection
        const countryNames = {
            'in': 'India',
            'us': 'USA',
            'fr': 'France',
            'ru': 'Russia'
        };
        DOM.conName.innerText = countryNames[country.toLowerCase()] || country;
        DOM.flag.src = `https://flagsapi.com/${country.toUpperCase()}/flat/32.png`;
    } else {
        // Update for search query
        DOM.conName.innerText = query || "World";
        DOM.flag.src = "world.png";
    }
}
function bindData(articles) {
    try {
        DOM.cardsContainer.innerHTML = '';

        if (!articles || articles.length === 0) {
            Utils.showError('No articles available.');
            return;
        }

        // Filter articles with valid data
        const validArticles = articles.filter(article =>
            article &&
            article.title &&
            article.title !== '[Removed]' &&
            article.description &&
            article.urlToImage &&
            article.url
        );

        if (validArticles.length === 0) {
            Utils.showError('No valid articles found.');
            return;
        }

        validArticles.forEach((article, index) => {
            try {
                const cardClone = DOM.newsCardTemplate.content.cloneNode(true);
                fillDataInCard(cardClone, article);

                // Add staggered animation
                const cardElement = cardClone.querySelector('.card');
                if (cardElement) {
                    cardElement.style.animationDelay = `${index * 0.1}s`;
                    cardElement.classList.add('card-enter');
                }

                DOM.cardsContainer.appendChild(cardClone);
            } catch (error) {
                console.error('Error creating article card:', error);
            }
        });

    } catch (error) {
        console.error('Error binding data:', error);
        Utils.showError('Error displaying articles.');
    }
}

function fillDataInCard(cardClone, article) {
    try {
        const newsImg = cardClone.querySelector('#news-img');
        const newsTitle = cardClone.querySelector('#news-title');
        const newsSource = cardClone.querySelector('#news-source');
        const newsDesc = cardClone.querySelector('#news-desc');

        // Safely set image with fallback
        newsImg.src = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
        newsImg.alt = article.title || 'News article image';

        // Handle image loading errors
        newsImg.onerror = function() {
            this.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
        };

        // Safely set text content (prevents XSS)
        newsTitle.textContent = article.title || 'No title available';
        newsDesc.textContent = article.description || 'No description available';

        // Format and set source with date
        const formattedDate = Utils.formatDate(article.publishedAt);
        const sourceName = article.source?.name || 'Unknown source';
        newsSource.textContent = `${sourceName} • ${formattedDate}`;

        // Add action buttons functionality
        const previewBtn = cardClone.querySelector('.preview-btn');
        const shareBtn = cardClone.querySelector('.share-btn-card');
        const cardElement = cardClone.firstElementChild;

        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openArticleModal(article);
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                shareArticle(article);
            });
        }

        // Add click handler for card (opens modal instead of direct link)
        if (cardElement && article.url) {
            cardElement.addEventListener('click', (e) => {
                e.preventDefault();
                openArticleModal(article);
            });

            // Add keyboard accessibility
            cardElement.setAttribute('tabindex', '0');
            cardElement.setAttribute('role', 'button');
            cardElement.setAttribute('aria-label', `Preview article: ${article.title}`);

            cardElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openArticleModal(article);
                }
            });
        }

    } catch (error) {
        console.error('Error filling card data:', error);
    }
}
// Navigation state management
let currentSelectedNav = null;

function onNavItemClick(category) {
    if (AppState.isLoading) return;

    try {
        // Sanitize category input
        const sanitizedCategory = Utils.sanitizeInput(category);

        // Fetch news for the category
        fetchNews(sanitizedCategory);

        // Update navigation UI
        updateNavigation(category);

    } catch (error) {
        console.error('Error in navigation click:', error);
    }
}

function updateNavigation(activeCategory) {
    // Remove active class from current selection
    if (currentSelectedNav) {
        currentSelectedNav.classList.remove('active');
    }

    // Add active class to new selection
    const navItem = document.getElementById(activeCategory);
    if (navItem) {
        currentSelectedNav = navItem;
        currentSelectedNav.classList.add('active');
    }
}

// Search functionality
function initializeSearch() {
    const performSearch = () => {
        if (AppState.isLoading) return;

        const query = DOM.searchText.value.trim();
        if (!query) {
            Utils.showError('Please enter a search term.');
            return;
        }

        if (query.length < 2) {
            Utils.showError('Search term must be at least 2 characters long.');
            return;
        }

        // Clear navigation selection
        if (currentSelectedNav) {
            currentSelectedNav.classList.remove('active');
            currentSelectedNav = null;
        }

        // Perform search
        fetchNews(query);

        // Clear search input
        DOM.searchText.value = '';
    };

    // Search button click
    DOM.searchButton.addEventListener('click', performSearch);

    // Enter key in search input
    DOM.searchText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// Country selection functionality
function initializeCountrySelection() {
    const countryLinks = document.querySelectorAll('.country ul li a');

    countryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            if (AppState.isLoading) return;

            const countryCode = link.id;
            const countryName = link.textContent;

            // Clear navigation selection
            if (currentSelectedNav) {
                currentSelectedNav.classList.remove('active');
                currentSelectedNav = null;
            }

            // Fetch country-specific news
            fetchNews(null, countryCode);
        });
    });
}

function reload() {
    if (AppState.isLoading) return;

    // Reset app state
    AppState.currentQuery = null;
    AppState.currentCountry = null;
    AppState.currentPage = 1;

    // Clear navigation
    if (currentSelectedNav) {
        currentSelectedNav.classList.remove('active');
        currentSelectedNav = null;
    }

    // Load default news
    fetchNews();
}

// Keyboard navigation for nav items
function initializeKeyboardNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });

    // Country selector keyboard navigation
    const countrySelector = document.querySelector('.select-con');
    const countryDropdown = document.querySelector('.country ul');

    if (countrySelector && countryDropdown) {
        countrySelector.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                countryDropdown.style.display = countryDropdown.style.display === 'block' ? 'none' : 'block';
                countrySelector.setAttribute('aria-expanded', countryDropdown.style.display === 'block');
            }
            if (e.key === 'Escape') {
                countryDropdown.style.display = 'none';
                countrySelector.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced search with debouncing
function initializeEnhancedSearch() {
    const debouncedSearch = debounce((query) => {
        if (query.length >= 2) {
            fetchNews(query);
        }
    }, 500);

    // Real-time search as user types (optional)
    DOM.searchText.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 3) {
            // debouncedSearch(query); // Uncomment for real-time search
        }
    });
}



// Enhanced navbar functionality
function initializeNavbar() {
    const navbar = document.querySelector('nav');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navContent = document.querySelector('.nav-content');
    let lastScrollY = window.scrollY;

    // Mobile menu toggle functionality
    if (mobileMenuToggle && navContent) {
        mobileMenuToggle.addEventListener('click', () => {
            const isActive = mobileMenuToggle.classList.contains('active');

            if (isActive) {
                mobileMenuToggle.classList.remove('active');
                navContent.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            } else {
                mobileMenuToggle.classList.add('active');
                navContent.classList.add('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        });

        // Close mobile menu when clicking on nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navContent.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navContent.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navContent.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navContent.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navContent.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll (only on desktop)
        if (window.innerWidth > 768) {
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }

        lastScrollY = currentScrollY;
    });

    // Add smooth scroll to top when logo is clicked
    const logo = document.querySelector('.daily');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Close mobile menu if open
            if (navContent && navContent.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navContent.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
            // Reload after scroll
            setTimeout(() => {
                reload();
            }, 500);
        });
    }

    // Enhanced country dropdown
    const countrySelector = document.querySelector('.country');
    const countryDropdown = document.querySelector('.country ul');

    if (countrySelector && countryDropdown) {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!countrySelector.contains(e.target)) {
                countryDropdown.style.display = 'none';
            }
        });

        // Toggle dropdown on click
        countrySelector.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = countryDropdown.style.display === 'block';
            countryDropdown.style.display = isVisible ? 'none' : 'block';
        });
    }
}

// Add navbar animations and effects
function addNavbarEffects() {
    // Add ripple effect to nav items
    const navItems = document.querySelectorAll('.hover-link');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add search bar focus effects
    const searchInput = document.getElementById('search-text');
    const searchBar = document.querySelector('.search-bar');

    if (searchInput && searchBar) {
        searchInput.addEventListener('focus', () => {
            searchBar.classList.add('focused');
        });

        searchInput.addEventListener('blur', () => {
            searchBar.classList.remove('focused');
        });
    }
}

// Initialize all event listeners
function initializeApp() {
    try {
        // First, initialize DOM references
        if (!initializeDOM()) {
            console.error('Failed to initialize DOM elements');
            return;
        }

        console.log('DOM initialized successfully');

        initializeSearch();
        initializeCountrySelection();
        initializeKeyboardNavigation();
        initializeEnhancedSearch();
        initializeModal();
        initializePagination();
        initializeNavbar();
        addNavbarEffects();

        // Add global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            Utils.showError('An unexpected error occurred. Please refresh the page.');
        });

        // Add unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            Utils.showError('A network error occurred. Please check your connection.');
        });

        console.log('Starting to fetch news...');

        // Load default news on startup
        fetchNews();

    } catch (error) {
        console.error('Error initializing app:', error);
        Utils.showError('Failed to initialize the application.');
    }
}

// Modal functionality
function openArticleModal(article) {
    const modal = document.getElementById('article-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-article-title');
    const modalSource = document.getElementById('modal-article-source');
    const modalDescription = document.getElementById('modal-article-description');
    const modalReadFull = document.getElementById('modal-read-full');

    // Populate modal content
    modalImage.src = article.urlToImage || 'https://via.placeholder.com/600x300?text=No+Image';
    modalImage.alt = article.title || 'Article image';
    modalTitle.textContent = article.title || 'No title available';
    modalSource.textContent = `${article.source?.name || 'Unknown source'} • ${Utils.formatDate(article.publishedAt)}`;
    modalDescription.textContent = article.description || 'No description available';
    modalReadFull.href = article.url;

    // Show modal
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    // Focus management
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.focus();

    // Setup sharing buttons
    setupSharingButtons(article);
}

function closeArticleModal() {
    const modal = document.getElementById('article-modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

function setupSharingButtons(article) {
    const shareTwitter = document.getElementById('share-twitter');
    const shareFacebook = document.getElementById('share-facebook');
    const shareLinkedIn = document.getElementById('share-linkedin');
    const shareCopy = document.getElementById('share-copy');

    const articleUrl = article.url;
    const articleTitle = article.title || 'Check out this news article';

    shareTwitter.onclick = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };

    shareFacebook.onclick = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
        window.open(facebookUrl, '_blank', 'width=550,height=420');
    };

    shareLinkedIn.onclick = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
        window.open(linkedInUrl, '_blank', 'width=550,height=420');
    };

    shareCopy.onclick = async () => {
        try {
            await navigator.clipboard.writeText(articleUrl);
            shareCopy.textContent = '✅';
            setTimeout(() => {
                shareCopy.textContent = '📋';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = articleUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            shareCopy.textContent = '✅';
            setTimeout(() => {
                shareCopy.textContent = '📋';
            }, 2000);
        }
    };
}

function shareArticle(article) {
    if (navigator.share) {
        // Use native sharing if available
        navigator.share({
            title: article.title,
            text: article.description,
            url: article.url
        }).catch(error => {
            console.log('Error sharing:', error);
            openArticleModal(article);
        });
    } else {
        // Fallback to modal
        openArticleModal(article);
    }
}

// Pagination functionality
function updatePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    const currentPageSpan = document.getElementById('current-page');
    const totalPagesSpan = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    // Calculate total pages (limited by API and our max pages setting)
    const totalPages = Math.min(
        Math.ceil(AppState.totalResults / AppState.articlesPerPage),
        AppState.maxPages
    );

    if (totalPages <= 1) {
        hidePagination();
        return;
    }

    // Show pagination
    paginationContainer.style.display = 'block';

    // Update page info
    currentPageSpan.textContent = AppState.currentPage;
    totalPagesSpan.textContent = totalPages;

    // Update button states
    prevBtn.disabled = AppState.currentPage <= 1;
    nextBtn.disabled = AppState.currentPage >= totalPages;
}

function hidePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.style.display = 'none';
}

function goToPage(page) {
    if (page < 1 || page > AppState.maxPages || AppState.isLoading) return;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch news for the new page
    fetchNews(AppState.currentQuery, AppState.currentCountry, page);
}

function initializePagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    prevBtn.addEventListener('click', () => {
        goToPage(AppState.currentPage - 1);
    });

    nextBtn.addEventListener('click', () => {
        goToPage(AppState.currentPage + 1);
    });

    // Keyboard navigation for pagination
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft' && e.ctrlKey) {
            e.preventDefault();
            goToPage(AppState.currentPage - 1);
        } else if (e.key === 'ArrowRight' && e.ctrlKey) {
            e.preventDefault();
            goToPage(AppState.currentPage + 1);
        }
    });
}

// Initialize modal event listeners
function initializeModal() {
    const modal = document.getElementById('article-modal');
    const closeBtn = modal.querySelector('.modal-close');

    // Close modal when clicking close button
    closeBtn.addEventListener('click', closeArticleModal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeArticleModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeArticleModal();
        }
    });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);



