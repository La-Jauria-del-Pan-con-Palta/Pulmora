document.addEventListener('DOMContentLoaded', function() {
    console.log("Community script loaded.");

    function initCarousel(config) {
        const { gridSelector, prevBtnId, nextBtnId, itemsToShow = 3 } = config;
        
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
            console.log(`Updating ${gridSelector}. Current index: ${currentIndex}`);

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
            console.log(`Next button clicked for ${gridSelector}`);
            if (currentIndex + itemsToShow < allItems.length) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            console.log(`Prev button clicked for ${gridSelector}`);
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        updateCarousel();
    }

    initCarousel({
        gridSelector: '.challenges-grid-js',
        prevBtnId: 'prev-challenge',
        nextBtnId: 'next-challenge',
        itemsToShow: 3
    });

    initCarousel({
        gridSelector: '.stories-grid-js',
        prevBtnId: 'prev-story',
        nextBtnId: 'next-story',
        itemsToShow: 3
    });

    console.log("Both carousels initialized.");
});