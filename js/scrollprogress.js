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
});
