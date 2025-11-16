document.addEventListener('DOMContentLoaded', function() {
    console.log("Education script loaded.");

    function initCarousel(config) {
        const { gridSelector, prevBtnId, nextBtnId, itemsToShow } = config;
        
        const grid = document.querySelector(gridSelector);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        
        if (!grid || !prevBtn || !nextBtn) {
            console.error(`Carousel elements not found for ${gridSelector}`);
            return;
        }

        const allItems = Array.from(grid.children);
        console.log(`Found ${allItems.length} items for ${gridSelector}`);

        if (allItems.length === 0) {
            console.log(`No items found. Hiding buttons for ${gridSelector}`);
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        let currentIndex = 0;

        function updateCarousel() {
            allItems.forEach((item, index) => {
                if (index >= currentIndex && index < currentIndex + itemsToShow) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });

            const showPrev = currentIndex > 0;
            const showNext = currentIndex + itemsToShow < allItems.length;

            prevBtn.style.display = showPrev ? 'flex' : 'none';
            nextBtn.style.display = showNext ? 'flex' : 'none';
        }

        nextBtn.addEventListener('click', () => {
            if (currentIndex + itemsToShow < allItems.length) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        updateCarousel();
    }

    initCarousel({
        gridSelector: '.papers-grid',
        prevBtnId: 'prev-paper',
        nextBtnId: 'next-paper',
        itemsToShow: 3
    });

    initCarousel({
        gridSelector: '.videos-grid',
        prevBtnId: 'prev-video',
        nextBtnId: 'next-video',
        itemsToShow: 2
    });

    initCarousel({
        gridSelector: '.links-grid',
        prevBtnId: 'prev-link',
        nextBtnId: 'next-link',
        itemsToShow: 3
    });

    console.log("All carousels initialized.");
});

function playVideo(thumbnailElement) {
    const videoCard = thumbnailElement.closest('.video-card');
    if (!videoCard) {
        console.error('No se encontró el video-card');
        return;
    }
    
    const videoId = videoCard.getAttribute('data-video-id');
    if (!videoId) {
        console.error('No se encontró el video ID');
        return;
    }
    
    const thumbnailContainer = videoCard.querySelector('.video-thumbnail');
    if (!thumbnailContainer) {
        console.error('No se encontró el thumbnail container');
        return;
    }
    
    const iframeWrapper = document.createElement('div');
    iframeWrapper.className = 'video-wrapper';
    iframeWrapper.innerHTML = `
        <iframe 
            src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
        </iframe>
    `;
    
    const iframe = iframeWrapper.querySelector('iframe');
    iframe.addEventListener('error', function() {
        console.log('Error al cargar iframe, abriendo en YouTube...');
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    });
    
    thumbnailContainer.parentNode.replaceChild(iframeWrapper, thumbnailContainer);
}

function playVideoInYouTube(thumbnailElement) {
    const videoCard = thumbnailElement.closest('.video-card');
    if (!videoCard) return;
    
    const videoId = videoCard.getAttribute('data-video-id');
    if (!videoId) return;
    
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}