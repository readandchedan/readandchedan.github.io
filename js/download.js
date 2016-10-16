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

