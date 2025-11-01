document.addEventListener('DOMContentLoaded', function() {
    
    const postLikeButtons = document.querySelectorAll('.like-btn:not(.comment-like-btn)');
    postLikeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.dataset.postId;
            handleLike('post', postId, this);
        });
    });

    const commentLikeButtons = document.querySelectorAll('.comment-like-btn');
    commentLikeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.dataset.commentId;
            handleLike('comment', commentId, this);
        });
    });

});

function handleLike(type, id, buttonElement) {
    const likeCountSpan = buttonElement.querySelector('.like-count');
    const csrfToken = getCookie('csrftoken');
    
    const url = (type === 'post') ? `/like-post/${id}/` : `/like-comment/${id}/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
        } else {
            likeCountSpan.textContent = data.total_likes;
            if (data.liked) {
                buttonElement.classList.add('liked');
            } else {
                buttonElement.classList.remove('liked');
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
