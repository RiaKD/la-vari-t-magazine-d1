console.log('JavaScript file loaded');

document.addEventListener('DOMContentLoaded', setupNavigation);

function setupNavigation() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdown = document.getElementById('myDropdown');
    const mobileNav = document.querySelector('.mobile-nav');
    const desktopNav = document.querySelector('.desktop-nav');

    function updateNavVisibility() {
        if (window.innerWidth >= 768) {
            mobileNav.style.display = 'none';
            desktopNav.style.display = 'block';
        } else {
            mobileNav.style.display = 'block';
            desktopNav.style.display = 'none';
            dropdown.style.display = 'none';
        }
    }

    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            menuBtn.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
            if (window.innerWidth < 768 && !event.target.matches('.menu-btn') && !dropdown.contains(event.target)) {
                dropdown.style.display = 'none';
                menuBtn.classList.remove('open');
            }
        });
    }

    window.addEventListener('resize', updateNavVisibility);
    updateNavVisibility(); // Call on initial load
}

function setupArticlesPage() {
    console.log('Articles page loaded');
    fetchArticles();
}

function fetchArticles() {
    fetch('https://script.google.com/macros/s/AKfycbzOdDUODZ-P2FzQJEsBefm0VZuOcCD6AtM3oJiihXIONhCNlsGu4q7T72tMp9TPWFoW4Q/exec')
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            const topArticles = data.articles.filter(article => 
                article.popularity === 1 || article.popularity === 2 || article.popularity === 3
            );
            displayTopArticles(topArticles); // Display only top articles
            displayArticles(data.articles); // Display all articles if needed
            setupTagFilters(data.articles);
        })
        .catch(error => console.error('Error fetching articles:', error));
}

function displayTopArticles(topArticles) {
    const topArticlesList = document.getElementById('top-articles-list');
    if (!topArticlesList) return;

    topArticlesList.innerHTML = topArticles.map(article => `
        <div class="article-tile" data-tags="${article.tags.join(',')}">
            <img src="${article.headerImage || 'default-image.jpg'}" alt="${article.title}" class="article-image">
            <div class="article-content">
                <h3 class="article-title"><a href="#" class="open-article" data-article-id="${article.id}">${article.title}</a></h3>
                <p class="article-info">By ${article.author} on ${formatDate(article.date)}</p>
                <p class="article-excerpt">${getExcerpt(article.article)}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to open the modal
    const articleLinks = topArticlesList.querySelectorAll('.open-article');
    articleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            const articleId = parseInt(link.dataset.articleId);
            const article = topArticles.find(a => a.id === articleId);
            if (article) {
                displayArticleInModal(article);
            }
        });
    });
}

function displayArticleInModal(article) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <h2>${article.title}</h2>
        <p>By ${article.author} on ${formatDate(article.date)}</p>
        <img src="${article.headerImage}" alt="${article.title}" style="max-width: 100%;">
        <div>${article.article.replace(/\n/g, '<br>')}</div> <!-- Preserve paragraphing -->
    `;
    const modal = document.getElementById('articleModal');
    modal.style.display = 'block';

    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function displayArticles(articles) {
    const articleList = document.getElementById('article-list');
    if (!articleList) return;

    articleList.innerHTML = articles.map(article => `
        <div class="article-tile" data-tags="${article.tags.join(',')}">
            <img src="${article.headerImage}" alt="${article.title}" class="article-image" onerror="this.onerror=null; this.src='logo.png';">
            <div class="article-content">
                <h3 class="article-title"><a href="#" data-article-id="${article.id}">${article.title}</a></h3>
                <p class="article-info">By ${article.author} on ${formatDate(article.date)}</p>
                <p class="article-excerpt">${getExcerpt(article.article)}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    setupArticleModals(articles);
}

function createArticleTile(article) {
    return `
        <div class="article-tile" data-tags="${article.tags.join(',')}">
            <img src="${article.headerImage}" alt="${article.title}" class="article-image">
            <div class="article-content">
                <h3 class="article-title"><a href="#" data-article-id="${article.id}">${article.title}</a></h3>
                <p class="article-info">By ${article.author} on ${formatDate(article.date)}</p>
                <p class="article-excerpt">${getExcerpt(article.article)}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function setupArticleModals(articles) {
    const articleList = document.getElementById('article-list');
    
    // Create modal elements if they don't exist
    let modal = document.getElementById('articleModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'articleModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div id="modalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalContent = document.getElementById('modalContent');
    const closeBtn = modal.querySelector('.close');

    articleList.addEventListener('click', (e) => {
        if (e.target.closest('.article-title a')) {
            e.preventDefault();
            const link = e.target.closest('.article-title a');
            const articleId = parseInt(link.dataset.articleId);
            const article = articles.find(a => a.id === articleId);
            if (article) {
                modalContent.innerHTML = `
                    <h2>${article.title}</h2>
                    <p>By ${article.author} on ${formatDate(article.date)}</p>
                    <img src="${article.headerImage}" alt="${article.title}" style="max-width: 100%;">
                    <div>${article.article}</div>
                `;
                modal.style.display = 'block';
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function getExcerpt(text) {
    return text.substring(0, 100) + '...';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Add these functions for tag filtering
let activeFilters = new Set(['all']);

function toggleFilter(tag) {
    if (tag === 'all') {
        activeFilters.clear();
        activeFilters.add('all');
    } else {
        activeFilters.delete('all');
        if (activeFilters.has(tag)) {
            activeFilters.delete(tag);
            if (activeFilters.size === 0) {
                activeFilters.add('all');
            }
        } else {
            activeFilters.add(tag);
        }
    }
    updateFilterDisplay();
    filterArticles();
}

function updateFilterDisplay() {
    document.querySelectorAll('.filter-tag').forEach(tagElement => {
        const tag = tagElement.getAttribute('data-tag');
        if (activeFilters.has(tag)) {
            tagElement.classList.add('active');
        } else {
            tagElement.classList.remove('active');
        }
    });
}

function filterArticles() {
    const articleTiles = document.querySelectorAll('.article-tile');
    articleTiles.forEach(tile => {
        const tags = tile.getAttribute('data-tags').split(',');
        if (activeFilters.has('all') || tags.some(tag => activeFilters.has(tag))) {
            tile.style.display = '';
        } else {
            tile.style.display = 'none';
        }
    });
}

function setupTagFilters(articles) {
    const tagFilter = document.getElementById('tag-filter');
    if (!tagFilter) return;

    const allTags = ['all', ...new Set(articles.flatMap(article => article.tags))];
    
    tagFilter.innerHTML = allTags.map(tag => 
        `<span class="filter-tag${tag === 'all' ? ' active' : ''}" data-tag="${tag}">${tag}</span>`
    ).join('');

    tagFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag')) {
            toggleFilter(e.target.dataset.tag);
        }
    });
}

document.addEventListener('DOMContentLoaded', setupNavigation);
document.addEventListener('DOMContentLoaded', setupArticlesPage);

function openArticle(articleId) {
    // This function should either open a modal with the article content
    // or redirect to the article page
    window.location.href = `article.html?id=${articleId}`;
}
