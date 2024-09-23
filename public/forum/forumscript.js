function goBack() {
    window.history.back();
}

async function fetchPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    try {
        const response = await fetch(`/api/posts/${postId}`);
        const post = await response.json();

        if (post) {
            document.getElementById('postTitle').textContent = post.Title;
            document.getElementById('postContent').textContent = post.noidung;
            fetchComments(postId); // Tải bình luận
        } else {
            console.error('Bài viết không tồn tại.');
        }
    } catch (error) {
        console.error('Error fetching post:', error);
    }
}

async function fetchComments(postId) {
    try {
        const response = await fetch(`/api/comments?postId=${postId}`);
        const comments = await response.json();
        const commentsContainer = document.getElementById('comments');
        commentsContainer.innerHTML = '';

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `
                ${comment.username}: ${comment.noidung}
                <button class="deleteButton" onclick="deleteComment(${comment.id})">Xóa</button>
            `;
            commentsContainer.appendChild(commentDiv);
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

async function deleteComment(commentId) {
    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            fetchComments(postId); // Tải lại bình luận
        } else {
            console.error('Failed to delete comment:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
}

async function submitComment() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Bạn cần đăng nhập để bình luận. Chuyển đến trang đăng nhập.');
        window.location.href = '../login/login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const commentContent = document.getElementById('commentInput').value;

    if (!commentContent) {
        alert('Vui lòng nhập bình luận.');
        return;
    }

    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId: postId,
                username: username,
                noidung: commentContent
            })
        });

        if (response.ok) {
            document.getElementById('commentInput').value = ''; // Xóa nội dung khung nhập
            fetchComments(postId); // Tải lại bình luận
        } else {
            console.error('Failed to submit comment:', response.statusText);
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

// Gọi hàm khi trang được tải
fetchPost();