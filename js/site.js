// Scroll Progress Bar Implementation
function updateScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    // Calculate percentage scrolled
    const scrolledPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    progressBar.style.width = scrolledPercentage + '%';
}

window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress); // Update on resize as well

// Quote Implementation
function initQuote() {
    var quotes = [
        "The ideal place for me is the one in which it is most natural to live as a foreigner. --- Italo Calvino",
        "Write a little every day, without hope and without despair. --- Isak Dinesen",
        "I don’t pretend to be an intellectual or a philosopher. I just look. –-- Josef Koudelka",
        "Think of nothing things, think of wind. --- Truman Capote",
        "Pain is inevitable. Suffering is optional. --- Haruki Murakami"
    ];
    var quoteElements = document.getElementsByClassName('quote');
    if (quoteElements.length > 0) {
        var quote_idx = Math.floor(Math.random() * quotes.length);
        quoteElements[0].innerHTML = quotes[quote_idx];
    }
}

// Initial call to set the progress bar correctly on load
document.addEventListener('DOMContentLoaded', function() {
    updateScrollProgress();
    initCategoryPagination();
    initSearch();
    initQuote();
});

// Search Implementation
function initSearch() {
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');
    var searchIcon = document.getElementById('search-icon');
    if (!searchInput || !searchResults) return;

    var posts = [];
    var searchIndexLoaded = false;
    var isSearchOpen = false;

    function toggleSearch() {
        isSearchOpen = !isSearchOpen;
        if (isSearchOpen) {
            searchInput.classList.add('active');
            searchInput.focus();
            loadSearchIndex();
        } else {
            searchInput.classList.remove('active');
            searchResults.style.display = 'none';
            searchInput.value = '';
        }
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSearch();
        });
    }

    function loadSearchIndex() {
        if (searchIndexLoaded) return;
        searchIndexLoaded = true;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/search.json', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    posts = JSON.parse(xhr.responseText);
                } catch (e) {
                    posts = [];
                }
                performSearch(searchInput.value);
            }
        };
        xhr.send();
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function getSnippet(text, query, snippetLength) {
        snippetLength = snippetLength || 100;
        var regex = new RegExp(escapeRegExp(query), 'i');
        var match = text.match(regex);
        if (!match) return text.substring(0, snippetLength) + '...';
        var index = match.index;
        var start = Math.max(0, index - Math.floor(snippetLength / 2));
        var end = Math.min(text.length, start + snippetLength);
        if (end - start < snippetLength) {
            start = Math.max(0, end - snippetLength);
        }
        var snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        return snippet;
    }

    function highlightText(text, query) {
        var regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function getCategoryLabel(category) {
        if (category === 'fiction') return '虚构.故事';
        if (category === 'nonfiction') return '闲谈.杂叙';
        if (category === 'tabletennis') return '体育.乒乓球';
        return '';
    }

    function performSearch(query) {
        query = query.trim();
        if (!query) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }
        if (!posts.length) {
            searchResults.innerHTML = '<div class="search-no-results">加载中...</div>';
            searchResults.style.display = 'block';
            return;
        }

        var lowerQuery = query.toLowerCase();
        var results = [];

        for (var i = 0; i < posts.length; i++) {
            var post = posts[i];
            var titleLower = (post.title || '').toLowerCase();
            var contentLower = (post.content || '').toLowerCase();
            var titleScore = titleLower.indexOf(lowerQuery) !== -1 ? 2 : 0;
            var contentScore = contentLower.indexOf(lowerQuery) !== -1 ? 1 : 0;
            if (titleScore || contentScore) {
                results.push({
                    post: post,
                    score: titleScore + contentScore
                });
            }
        }

        results.sort(function(a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return (a.post.date || '').localeCompare(b.post.date || '');
        });

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">没有找到结果</div>';
            searchResults.style.display = 'block';
            return;
        }

        var html = '';
        var maxResults = 10;
        for (var j = 0; j < Math.min(results.length, maxResults); j++) {
            var r = results[j];
            var post = r.post;
            var snippet = getSnippet(post.content || '', query, 120);
            snippet = highlightText(snippet, query);
            var titleHighlighted = highlightText(post.title || '', query);
            var categoryLabel = getCategoryLabel(post.category);
            var categoryHtml = categoryLabel ? '<span class="search-category">' + categoryLabel + '</span>' : '';
            html += '<a href="' + post.url + '" class="search-result-item">' +
                '<div class="search-result-title">' + titleHighlighted + '</div>' +
                '<div class="search-result-meta">' + categoryHtml + '<span class="search-result-date">' + (post.date || '') + '</span></div>' +
                '<div class="search-result-snippet">' + snippet + '</div>' +
                '</a>';
        }
        if (results.length > maxResults) {
            html += '<div class="search-more">还有 ' + (results.length - maxResults) + ' 个结果</div>';
        }
        searchResults.innerHTML = html;
        searchResults.style.display = 'block';
    }

    searchInput.addEventListener('focus', function() {
        loadSearchIndex();
        if (searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
    });

    var debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            performSearch(searchInput.value);
        }, 150);
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !(searchIcon && searchIcon.contains(e.target))) {
            if (isSearchOpen) {
                toggleSearch();
            } else {
                searchResults.style.display = 'none';
            }
        }
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchResults.style.display = 'none';
            searchInput.blur();
        }
    });
}

// Category Pagination Implementation
function initCategoryPagination() {
    var perPage = 20;
    var postsContainer = document.getElementById('category-posts');
    var paginationContainer = document.getElementById('pagination');
    if (!postsContainer || !paginationContainer) return;

    var items = postsContainer.querySelectorAll('.post-item');
    var total = items.length;
    if (total <= perPage) return;

    var prevBtn = document.getElementById('prev-page');
    var nextBtn = document.getElementById('next-page');
    var pageInfo = document.getElementById('page-info');
    var current = 1;
    var pages = Math.ceil(total / perPage);

    function getHashPage() {
        var hash = window.location.hash;
        if (!hash) return null;
        var match = hash.match(/^#page(\d+)$/);
        if (!match) return null;
        var page = parseInt(match[1], 10);
        if (isNaN(page) || page < 1 || page > pages) return null;
        return page;
    }

    function updateHash(page) {
        if (page === 1) {
            // Remove hash when on page 1 for cleaner URLs
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        } else {
            history.replaceState(null, '', '#page' + page);
        }
    }

    function showPage(page, skipHashUpdate) {
        var start = (page - 1) * perPage;
        var end = start + perPage;
        for (var i = 0; i < total; i++) {
            items[i].style.display = (i >= start && i < end) ? 'list-item' : 'none';
        }
        prevBtn.style.visibility = page === 1 ? 'hidden' : 'visible';
        nextBtn.style.visibility = page === pages ? 'hidden' : 'visible';
        pageInfo.textContent = 'Page ' + page + ' of ' + pages;
        current = page;
        if (!skipHashUpdate) {
            updateHash(page);
        }
    }

    prevBtn.addEventListener('click', function() { if (current > 1) showPage(current - 1); });
    nextBtn.addEventListener('click', function() { if (current < pages) showPage(current + 1); });

    // Listen for hash changes (e.g., back/forward buttons, manual URL edits)
    window.addEventListener('hashchange', function() {
        var page = getHashPage();
        if (page !== null && page !== current) {
            showPage(page, true);
        }
    });

    paginationContainer.style.display = 'block';

    // Determine initial page from URL hash, default to 1
    var initialPage = getHashPage() || 1;
    showPage(initialPage, true);
}
