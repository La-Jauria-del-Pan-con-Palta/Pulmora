document.addEventListener('DOMContentLoaded', function() {
    console.log("Community script loaded.");

    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) {
        console.log("Carousel container not found. Exiting.");
        return;
    }
    console.log("Carousel container found.");

    const prevBtn = document.getElementById('prev-story');
    const nextBtn = document.getElementById('next-story');
    const grid = document.querySelector('.stories-grid-js');
    
    if (!grid || !prevBtn || !nextBtn) {
        console.error("A required carousel element (grid, prev, or next button) is missing.");
        return;
    }

    const allStories = Array.from(grid.querySelectorAll('.story-card'));
    console.log(`Found ${allStories.length} story cards.`);

    if (allStories.length === 0) {
        console.log("No stories found. Hiding buttons.");
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    const storiesToShow = 3;
    let currentIndex = 0;

    function updateCarousel() {
        console.log(`Updating carousel. Current index: ${currentIndex}`);

        // Mostrar/ocultar tarjetas
        allStories.forEach((card, index) => {
            if (index >= currentIndex && index < currentIndex + storiesToShow) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        const showPrev = currentIndex > 0;
        const showNext = currentIndex + storiesToShow < allStories.length;

        console.log(`Show Prev: ${showPrev}, Show Next: ${showNext}`);
        prevBtn.style.display = showPrev ? 'flex' : 'none';
        nextBtn.style.display = showNext ? 'flex' : 'none';
    }

    nextBtn.addEventListener('click', () => {
        console.log("Next button clicked.");
        if (currentIndex + storiesToShow < allStories.length) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener('click', () => {
        console.log("Prev button clicked.");
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    console.log("Initial carousel update.");
    updateCarousel(); 
});
