var downloadBySelector = function(selector) {
    document.querySelectorAll(selector).forEach(function(node){
        var a = document.createElement('a');
        a.href = node.getAttribute("href")
        a.target = "_blank"
        a.setAttribute("download", "")
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })    
}

var map = {
        '4chan.org': '.fileThumb',
}

var downloadByDomain ＝ function() {
        downloadBySelector(map[window.location.hostname]);
}

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
