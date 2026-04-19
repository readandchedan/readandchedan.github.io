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

// Initial call to set the progress bar correctly on load
document.addEventListener('DOMContentLoaded', function() {
    updateScrollProgress();
    initCategoryPagination();
});

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
