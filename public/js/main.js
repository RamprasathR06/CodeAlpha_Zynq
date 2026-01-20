// Intersection Observer for autoplay
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (!video) return;

        if (entry.isIntersecting) {
            // Post is visible
            video.play().catch(err => console.log('Autoplay prevented:', err));
            entry.target.classList.add('playing');
        } else {
            // Post is not visible
            video.pause();
            video.currentTime = 0;
            entry.target.classList.remove('playing');
        }
    });
}, { threshold: 0.5 }); // Trigger when 50% of post is visible

document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const homePage = document.getElementById('home-page');
    let currentUserId = null;

    // Auth Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');

    // Toggle Forms
    showRegisterBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Join the community';
    });

    showLoginBtn.addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authTitle.textContent = 'Welcome to Zynq';
        authSubtitle.textContent = 'Login to continue';
    });

    // Splash Screen Logic
    setTimeout(() => {
        splashScreen.classList.add('exit'); // Trigger exit animation

        setTimeout(() => {
            splashScreen.classList.add('hidden');
            authContainer.classList.remove('hidden'); // Show Auth container
            authContainer.style.opacity = '1';

        }, 800); // Wait for exit animation (0.8s)
    }, 2500); // Display for 2.5s

    // Lamp logic - Initialize immediately
    const lampSwitch = document.querySelector('.pull-string');
    const authContainerEl = document.getElementById('auth-container');
    // authTitle is already declared at the top

    if (lampSwitch && authContainerEl) {
        lampSwitch.addEventListener('click', () => {
            console.log('Lamp switch clicked');
            const isOn = authContainerEl.classList.toggle('lamp-on');
            if (isOn) {
                authTitle.textContent = 'Welcome back!';
                document.getElementById('auth-subtitle').textContent = 'Please login.';
            } else {
                authTitle.textContent = 'Welcome to Zynq';
                document.getElementById('auth-subtitle').textContent = 'Turn on the light to login';
            }
        });
    }

    // --- Session Persistence ---
    function loginUser(user) {
        currentUserId = user._id.toString();
        localStorage.setItem('zynq_user', JSON.stringify(user));

        loadPosts();
        loadMyFriends();
        loadFriendRequests();

        authContainer.classList.add('hidden');
        homePage.classList.remove('hidden');
        homePage.style.opacity = '1';

        const currentUsername = document.getElementById('current-username');
        const currentHandle = document.getElementById('current-handle');
        const avatarDisplay = document.getElementById('current-user-avatar');
        const postBoxAvatar = document.getElementById('post-box-avatar');

        if (currentUsername) currentUsername.textContent = user.username;
        if (currentHandle) currentHandle.textContent = '@' + user.username.toLowerCase();

        const initial = user.username.charAt(0).toUpperCase();
        if (avatarDisplay) avatarDisplay.textContent = initial;
        if (postBoxAvatar) postBoxAvatar.textContent = initial;

        const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        const colorIndex = user.username.length % colors.length;
        if (avatarDisplay) avatarDisplay.style.background = colors[colorIndex];
        if (postBoxAvatar) postBoxAvatar.style.background = colors[colorIndex];
    }

    document.getElementById('logout-btn').onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('zynq_user');
        location.reload();
    };

    const savedUser = localStorage.getItem('zynq_user');
    if (savedUser) {
        loginUser(JSON.parse(savedUser));
    }

    // Login Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                loginUser(data.user);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        }
    });

    // Register Logic
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const age = document.getElementById('reg-age').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, age, password })
            });
            const data = await res.json();

            if (data.success) {
                alert('Registration successful! Please login.');
                registerForm.reset();
                // Switch to login form
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                authTitle.textContent = 'Welcome back!';
                authSubtitle.textContent = 'Please login.';
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        }
    });

    // --- Post Logic ---
    const createPostBtn = document.getElementById('create-post-btn');
    const createPostInput = document.getElementById('create-post-input');
    const feedContainer = document.getElementById('feed-posts');

    // Add Image Input for Posts
    const postBox = document.querySelector('.create-post-box');
    const postImageInput = document.createElement('input');
    postImageInput.type = 'file';
    postImageInput.accept = 'image/*,video/*';
    postImageInput.style.display = 'none';
    postBox.appendChild(postImageInput);

    const postImageBtn = document.createElement('button');
    postImageBtn.className = 'btn-icon';
    postImageBtn.textContent = '📸'; // Camera emoji without extra symbols
    postImageBtn.style.fontSize = '1.2rem';
    postImageBtn.style.background = 'transparent';
    postImageBtn.style.border = 'none';
    postImageBtn.style.cursor = 'pointer';
    postImageBtn.type = 'button';
    postBox.insertBefore(postImageBtn, createPostBtn);

    postImageBtn.onclick = () => postImageInput.click();

    postImageInput.onchange = () => {
        if (postImageInput.files.length > 0) {
            const file = postImageInput.files[0];
            const reader = new FileReader();
            const isVideo = file.type.startsWith('video');

            reader.onload = (e) => {
                const previewImg = document.getElementById('post-preview-img');
                const previewVideo = document.getElementById('post-preview-video');

                if (isVideo) {
                    if (previewImg) previewImg.classList.add('hidden');
                    if (previewVideo) {
                        previewVideo.src = e.target.result;
                        previewVideo.classList.remove('hidden');
                    }
                } else {
                    if (previewVideo) previewVideo.classList.add('hidden');
                    if (previewImg) {
                        previewImg.src = e.target.result;
                        previewImg.classList.remove('hidden');
                    }
                }
                document.getElementById('post-image-preview').classList.remove('hidden');
                postImageBtn.style.color = 'var(--primary-color)';
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('remove-post-image').onclick = () => {
        postImageInput.value = '';
        document.getElementById('post-image-preview').classList.add('hidden');
        postImageBtn.style.color = '';
    };

    // Helper: Render a Single Post
    function renderPost(post) {
        const postEl = document.createElement('div');
        postEl.className = 'post-card';

        const initial = post.user.username.charAt(0).toUpperCase();
        const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        const colorIndex = post.user.username.length % colors.length;
        const bg = colors[colorIndex];

        const date = new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let mediaHtml = '';
        const mediaSource = post.mediaUrl || post.image;
        if (mediaSource) {
            if (post.mediaType === 'video') {
                mediaHtml = `<video src="${mediaSource}" controls muted playsinline class="post-video" style="width:100%; border-radius:0.8rem; margin-top:1rem;"></video>`;
            } else {
                mediaHtml = `<img src="${mediaSource}" class="post-image" style="width:100%; border-radius:0.8rem; margin-top:1rem;">`;
            }
        }

        const likesCount = post.likes ? post.likes.length : 0;
        const commentsCount = post.comments ? post.comments.length : 0;
        const repostsCount = post.shares ? post.shares.length : 0; // Using shares as reposts for now
        const viewsCount = post.viewedBy ? post.viewedBy.length : 0;
        const isLiked = post.likes && post.likes.some(id => id.toString() === currentUserId.toString());
        const isShared = post.shares && post.shares.some(id => id.toString() === currentUserId.toString());
        const heartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
        const commentIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
        const repostIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isShared ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`;
        const shareIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>`;
        const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;

        const savedUserData = JSON.parse(localStorage.getItem('zynq_user') || '{}');
        const isSaved = savedUserData.savedPosts && savedUserData.savedPosts.includes(post._id);
        const saveIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

        const isOwner = post.user._id.toString() === currentUserId.toString();
        const deleteBtnHtml = isOwner ? `
            <button class="btn-icon delete-post-btn" onclick="window.deletePost('${post._id}', this)" title="Delete Post">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
        ` : '';

        postEl.innerHTML = `
            <div class="post-header">
                <div style="display:flex; gap:1rem; align-items:center;">
                    <div class="avatar initial-avatar" style="background:${bg}">${initial}</div>
                    <div class="post-info">
                        <h3 onclick="window.viewUserProfile('${post.user._id.toString()}')" style="cursor:pointer">${post.user.username}</h3>
                        <span>${date}</span>
                    </div>
                </div>
                ${deleteBtnHtml}
            </div>
            <div class="post-content">
                <p>${post.content || ''}</p>
                ${mediaHtml}
            </div>
            <div class="post-footer-stats" style="padding: 0.8rem 0 0.5rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 1rem; opacity: 0.8;">
                <span id="views-${post._id}">${eyeIcon} ${viewsCount} views</span>
            </div>
            <div class="post-actions" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.8rem; display: flex; justify-content: space-between;">
                <div style="display: flex; gap: 1.5rem;">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="window.toggleLike('${post._id}', this)">
                        ${heartIcon} <span class="count">${likesCount}</span>
                    </button>
                    <button class="action-btn" onclick="window.openComments('${post._id}')">
                        ${commentIcon} <span class="count">${commentsCount}</span>
                    </button>
                    <button class="action-btn ${isShared ? 'shared' : ''}" onclick="window.sharePost('${post._id}', this)">
                        ${repostIcon} <span class="count">${repostsCount}</span>
                    </button>
                </div>
                <div style="display: flex; gap: 1.5rem;">
                    <button class="action-btn" onclick="window.trueShare('${post._id}')" title="Share to friends">
                        ${shareIcon}
                    </button>
                    <button class="action-btn ${isSaved ? 'saved' : ''}" onclick="window.toggleSave('${post._id}', this)" title="Save Post">
                        ${saveIcon}
                    </button>
                </div>
            </div>
        `;

        // Increment view with local UI update
        window.incrementView(post._id);

        // Observe video for autoplay
        if (post.mediaType === 'video') {
            setTimeout(() => {
                videoObserver.observe(postEl);
            }, 0);
        }

        return postEl;
    }

    window.deletePost = async (postId, btn) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });

            const data = await res.json();
            if (data.success) {
                // Remove from UI
                const postCard = btn.closest('.post-card');
                if (postCard) {
                    postCard.style.opacity = '0';
                    postCard.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        postCard.remove();
                        // Check if feed is empty
                        if (feedContainer.children.length === 0) {
                            feedContainer.innerHTML = '<div class="empty-state"><p>No posts yet. Be the first to post!</p></div>';
                        }
                    }, 300);
                }
            } else {
                alert('Failed to delete: ' + data.message);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('An error occurred while deleting the post.');
        }
    };

    window.toggleLike = async (postId, btn) => {
        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            const data = await res.json();
            if (data.success) {
                btn.classList.toggle('liked', data.isLiked);
                const heartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${data.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
                btn.innerHTML = `${heartIcon} <span class="count">${data.likesCount}</span>`;
            }
        } catch (err) { console.error(err); }
    };

    window.toggleSave = async (postId, btn) => {
        try {
            const res = await fetch(`/api/posts/${postId}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            const data = await res.json();
            if (data.success) {
                const saveIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${data.isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
                btn.innerHTML = saveIcon;
                btn.classList.toggle('saved', data.isSaved);

                // Update local storage
                const savedUser = JSON.parse(localStorage.getItem('zynq_user') || '{}');
                if (!savedUser.savedPosts) savedUser.savedPosts = [];
                if (data.isSaved) {
                    if (!savedUser.savedPosts.includes(postId)) savedUser.savedPosts.push(postId);
                } else {
                    savedUser.savedPosts = savedUser.savedPosts.filter(id => id !== postId);
                }
                localStorage.setItem('zynq_user', JSON.stringify(savedUser));
            }
        } catch (err) { console.error(err); }
    };

    window.sharePost = async (postId, btn) => {
        try {
            const res = await fetch(`/api/posts/${postId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            const data = await res.json();
            if (data.success) {
                const countSpan = btn.querySelector('.count');
                if (countSpan) countSpan.textContent = data.sharesCount;
                btn.classList.toggle('shared', data.isShared);

                // Update Icon fill
                const repostIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${data.isShared ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`;
                btn.innerHTML = `${repostIcon} <span class="count">${data.sharesCount}</span>`;

                console.log("Post share toggled. Shared:", data.isShared);
                if (data.isShared) {
                    alert("Reposted!");
                } else {
                    alert("Repost removed.");
                }
                loadPosts(); // Refresh view
            }
        } catch (err) { console.error("Share error:", err); }
    };

    window.trueShare = async (postId) => {
        const shareModal = document.getElementById('share-friends-modal');
        const shareList = document.getElementById('share-friends-list');
        shareModal.classList.add('active');
        shareList.innerHTML = '<p class="text-muted">Loading friends...</p>';

        try {
            // Fetch my friends
            const res = await fetch(`/api/users/${currentUserId}`);
            const data = await res.json();
            if (data.success && data.user.friends.length > 0) {
                shareList.innerHTML = '';
                // Need to fetch each friend details or use a combined route
                for (let fId of data.user.friends) {
                    const fRes = await fetch(`/api/users/${fId}`);
                    const fData = await fRes.json();
                    if (fData.success) {
                        const friend = fData.user;
                        const item = document.createElement('div');
                        item.className = 'friend-item';
                        item.style.display = 'flex';
                        item.style.justifyContent = 'space-between';
                        item.style.alignItems = 'center';
                        item.style.padding = '0.8rem';
                        item.style.background = 'rgba(255,255,255,0.05)';
                        item.style.borderRadius = '0.5rem';

                        item.innerHTML = `
                            <span>${friend.username}</span>
                            <button class="btn-primary btn-sm" onclick="window.sendPostToFriend('${postId}', '${friend._id}', '${friend.username}')">Send</button>
                        `;
                        shareList.appendChild(item);
                    }
                }
            } else {
                shareList.innerHTML = '<p class="text-muted">No friends to share with.</p>';
            }
        } catch (err) { console.error(err); }
    };

    window.sendPostToFriend = async (postId, friendId, friendName) => {
        try {
            const postUrl = `${window.location.origin}/post/${postId}`;
            const formData = new FormData();
            formData.append('sender', currentUserId);
            formData.append('receiver', friendId);
            formData.append('content', `Check out this post: ${postUrl}`);

            const res = await fetch('/api/messages', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert(`Shared with ${friendName}!`);
                document.getElementById('share-friends-modal').classList.remove('active');
            }
        } catch (err) { console.error(err); }
    };

    document.getElementById('close-share-modal').onclick = () => {
        document.getElementById('share-friends-modal').classList.remove('active');
    };

    window.incrementView = async (postId) => {
        if (!currentUserId) return;
        try {
            const res = await fetch(`/api/posts/${postId}/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            const data = await res.json();
            if (data.success) {
                const viewEl = document.getElementById(`views-${postId}`);
                if (viewEl) {
                    const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
                    viewEl.innerHTML = `${eyeIcon} ${data.views || 0} views`;
                }
            }
        } catch (err) { console.error(err); }
    };

    // Comment Modal Logic
    const commentModal = document.getElementById('comment-modal');
    const commentsList = document.getElementById('modal-comments-list');
    const commentInput = document.getElementById('modal-comment-input');
    const submitCommentBtn = document.getElementById('modal-submit-comment');
    let activeCommentPostId = null;

    window.openComments = async (postId) => {
        activeCommentPostId = postId;
        commentModal.classList.add('active');
        loadModalComments(postId);
    };

    document.getElementById('close-comment-modal').onclick = () => {
        commentModal.classList.remove('active');
        activeCommentPostId = null;
    };

    async function loadModalComments(postId) {
        try {
            commentsList.innerHTML = '<p class="text-muted" style="text-align:center;">Loading comments...</p>';
            const res = await fetch('/api/posts');
            const data = await res.json();
            if (data.success) {
                const post = data.posts.find(p => p._id === postId);
                if (post) {
                    commentsList.innerHTML = '';
                    if (!post.comments || post.comments.length === 0) {
                        commentsList.innerHTML = '<p class="text-muted" style="text-align:center; padding:1.5rem;">No comments yet. Be the first to share your thoughts!</p>';
                    } else {
                        post.comments.forEach(c => {
                            const div = document.createElement('div');
                            div.className = 'comment-item';
                            div.style.background = 'rgba(255,255,255,0.03)';
                            div.style.padding = '0.8rem';
                            div.style.borderRadius = '0.7rem';
                            div.style.border = '1px solid rgba(255,255,255,0.03)';

                            const commentDate = new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                            div.innerHTML = `
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                                    <strong style="color:var(--primary-color); font-size:0.95rem;">${c.user.username}</strong>
                                    <span style="opacity:0.4; font-size:0.75rem;">${commentDate}</span>
                                </div>
                                <p style="font-size:0.9rem; line-height:1.4; color:rgba(255,255,255,0.9);">${c.text}</p>
                            `;
                            commentsList.appendChild(div);
                        });
                        // Scroll to bottom of comments
                        commentsList.scrollTop = commentsList.scrollHeight;
                    }
                }
            }
        } catch (err) {
            console.error("Load comments error:", err);
            commentsList.innerHTML = '<p class="text-muted">Error loading comments.</p>';
        }
    }

    submitCommentBtn.onclick = async () => {
        const text = commentInput.value.trim();
        if (!text) return;
        if (!activeCommentPostId) {
            console.error("No active post ID for comment!");
            return;
        }

        try {
            console.log("Submitting comment for post:", activeCommentPostId);
            const res = await fetch(`/api/posts/${activeCommentPostId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, text })
            });
            const data = await res.json();
            if (data.success) {
                commentInput.value = '';
                loadModalComments(activeCommentPostId);
                loadPosts(); // Refresh main feed count
            } else {
                alert("Error: " + (data.message || "Failed to post comment"));
            }
        } catch (err) {
            console.error("Submit comment error:", err);
            alert("Connection error while posting comment.");
        }
    };



    // --- Stories Logic ---
    const addStoryBtn = document.getElementById('add-story-btn');
    const storyFileInput = document.getElementById('story-file-input');
    const storiesGrid = document.getElementById('active-stories');

    addStoryBtn.onclick = () => storyFileInput.click();

    storyFileInput.onchange = async () => {
        if (storyFileInput.files.length === 0) return;
        const formData = new FormData();
        formData.append('userId', currentUserId);
        formData.append('image', storyFileInput.files[0]);
        // Note: although the field is called 'image' in Multer, it handles videos too via resource_type: 'auto' or 'video'

        try {
            const res = await fetch('/api/stories', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                loadStories();
            }
        } catch (err) { console.error(err); }
    };

    async function loadStories() {
        if (!currentUserId) return;
        try {
            const res = await fetch(`/api/stories?userId=${currentUserId}`);
            const data = await res.json();
            storiesGrid.innerHTML = '';
            if (data.success) {
                data.stories.forEach(story => {
                    const item = document.createElement('div');
                    item.className = 'story-item';
                    item.innerHTML = `
                        <div class="story-ring">
                            ${story.mediaType === 'video' ?
                            `<video src="${story.mediaUrl || story.image}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></video>` :
                            `<img src="${story.mediaUrl || story.image}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
                        }
                        </div>
                        <span class="story-user">${story.user.username}</span>
                    `;
                    storiesGrid.appendChild(item);
                });
            }
        } catch (err) { console.error(err); }
    }

    // Initial load
    loadStories();

    async function loadPosts() {
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            if (data.success) {
                feedContainer.innerHTML = '';
                if (data.posts.length === 0) {
                    feedContainer.innerHTML = '<div class="empty-state"><p>No posts yet. Be the first to post!</p></div>';
                } else {
                    data.posts.forEach(post => {
                        feedContainer.appendChild(renderPost(post));
                    });
                }
            }
        } catch (err) {
            console.error('Load Posts Error:', err);
        }
    }

    createPostBtn.addEventListener('click', async () => {
        if (!currentUserId) {
            alert('Session expired. Please login again.');
            return;
        }
        const content = createPostInput.value.trim();
        if (!content && postImageInput.files.length === 0) return;

        const formData = new FormData();
        formData.append('userId', currentUserId);
        formData.append('content', content);
        if (postImageInput.files[0]) {
            formData.append('image', postImageInput.files[0]);
        }

        try {
            createPostBtn.disabled = true;
            createPostBtn.textContent = 'Posting...';

            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                createPostInput.value = '';
                postImageInput.value = '';
                postImageBtn.style.color = '';
                document.getElementById('post-image-preview').classList.add('hidden');

                const newPostEn = renderPost(data.post);
                const emptyState = feedContainer.querySelector('.empty-state');
                if (emptyState) emptyState.remove();
                feedContainer.prepend(newPostEn);
            } else {
                alert('Failed to post: ' + data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            createPostBtn.disabled = false;
            createPostBtn.textContent = 'Post';
        }
    });

    // --- Navigation & View Management ---
    const navHome = document.getElementById('nav-home');
    const navFriends = document.getElementById('nav-friends');
    const navNotif = document.getElementById('nav-notifications');
    const navChat = document.getElementById('nav-chat');

    const mainFeed = document.querySelector('.main-feed');
    const friendsView = document.getElementById('friends-view');
    const chatView = document.getElementById('chat-view');
    const profileView = document.getElementById('profile-view');

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('friend-search-input');
    const searchResultsDiv = document.getElementById('search-results');
    const requestsListDiv = document.getElementById('friend-requests-list');
    const myFriendsGrid = document.getElementById('my-friends-grid');
    const notifBadge = document.getElementById('notif-badge');

    let activeChatFriendId = null;
    let chatInterval = null;

    const settingsView = document.getElementById('settings-view');

    function hideAllViews() {
        mainFeed.classList.add('hidden');
        friendsView.classList.add('hidden');
        chatView.classList.add('hidden');
        profileView.classList.add('hidden');
        if (settingsView) settingsView.classList.add('hidden');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        if (chatInterval) clearInterval(chatInterval);
    }

    function showHomeView() {
        hideAllViews();
        if (navHome) navHome.classList.add('active');
        mainFeed.classList.remove('hidden');
        loadPosts();

        // Clear home search if needed
        const hSearch = document.getElementById('home-search-input');
        const hResults = document.getElementById('home-search-results');
        if (hSearch) hSearch.value = '';
        if (hResults) hResults.classList.add('hidden');
    }

    function showFriendsView() {
        hideAllViews();
        if (navFriends) navFriends.classList.add('active');
        friendsView.classList.remove('hidden');
        loadFriendRequests();
        loadMyFriends();
    }

    function showChatView(friendId, friendName) {
        hideAllViews();
        if (navChat) navChat.classList.add('active');
        chatView.classList.remove('hidden');
        activeChatFriendId = friendId;

        document.getElementById('chat-header-name').textContent = friendName;
        const initial = friendName.charAt(0).toUpperCase();
        const colors = ['#a855f7', '#ec4899', '#3b82f6'];
        document.getElementById('chat-header-avatar').textContent = initial;
        document.getElementById('chat-header-avatar').style.background = colors[friendName.length % colors.length];

        loadMessages();
        chatInterval = setInterval(loadMessages, 3000);
    }

    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); showHomeView(); });
    if (navFriends) navFriends.addEventListener('click', (e) => { e.preventDefault(); showFriendsView(); });

    // Sidebar search trigger
    const sidebarSearchTrigger = document.getElementById('sidebar-search-trigger');
    if (sidebarSearchTrigger) {
        sidebarSearchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            showHomeView();
            const searchInput = document.getElementById('home-search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    if (navChat) navChat.addEventListener('click', (e) => {
        e.preventDefault();
        showFriendsView();
        // Scroll to My Friends to start a chat
        setTimeout(() => {
            const friendsGrid = document.getElementById('my-friends-grid');
            if (friendsGrid) friendsGrid.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    const navProfile = document.getElementById('nav-profile');
    if (navProfile) {
        navProfile.addEventListener('click', (e) => {
            e.preventDefault();
            viewUserProfile(currentUserId);
        });
    }

    const navSettings = document.getElementById('nav-settings');
    if (navSettings) {
        navSettings.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllViews();
            navSettings.classList.add('active');
            if (settingsView) {
                settingsView.classList.remove('hidden');
                settingsView.style.opacity = '0';
                setTimeout(() => settingsView.style.opacity = '1', 10);
            }
        });
    }

    // Settings Tab Switching
    const settingsNavItems = document.querySelectorAll('.settings-nav-item');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');

    settingsNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');

            // Update nav items
            settingsNavItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update content areas
            settingsTabContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `settings-content-${tabId}`) {
                    content.classList.remove('hidden');
                }
            });

            loadSettingsTabContent(tabId);
        });
    });

    async function loadSettingsTabContent(tabId) {
        if (!currentUserId) return;
        const container = document.getElementById(`settings-content-${tabId}`);
        if (!container) return;

        if (tabId === 'saved') {
            container.innerHTML = '<h3>Saved Items</h3><div class="posts-grid" id="settings-saved-posts">Loading...</div>';
            try {
                const res = await fetch(`/api/users/${currentUserId}/saved`);
                const data = await res.json();
                const grid = document.getElementById('settings-saved-posts');
                grid.innerHTML = '';
                if (data.success && data.savedPosts.length > 0) {
                    data.savedPosts.forEach(post => {
                        grid.appendChild(renderPost(post));
                    });
                } else {
                    grid.innerHTML = '<p class="text-muted">No saved posts yet.</p>';
                }
            } catch (err) { console.error(err); }
        } else if (tabId === 'activity') {
            container.innerHTML = `
                <h3>Your Activity</h3>
                <div class="activity-sections">
                    <div class="activity-section">
                        <h4>Recent Likes</h4>
                        <div id="activity-likes" class="activity-list">Loading...</div>
                    </div>
                    <div class="activity-section" style="margin-top:2rem;">
                        <h4>Recent Comments</h4>
                        <div id="activity-comments" class="activity-list">Loading...</div>
                    </div>
                    <div class="activity-section" style="margin-top:2rem;">
                        <h4>Watch History</h4>
                        <div id="activity-views" class="activity-list">Loading...</div>
                    </div>
                </div>
            `;
            try {
                const res = await fetch(`/api/users/${currentUserId}/activity`);
                const data = await res.json();
                if (data.success) {
                    const renderActivity = (posts, elId, emptyText) => {
                        const el = document.getElementById(elId);
                        el.innerHTML = '';
                        if (posts.length > 0) {
                            posts.forEach(post => {
                                const item = document.createElement('div');
                                item.className = 'activity-item';
                                item.style = 'padding:1rem; background:rgba(255,255,255,0.05); border-radius:0.5rem; margin-bottom:0.5rem; cursor:pointer;';
                                item.innerHTML = `<strong>${post.user.username}</strong>: ${post.content ? post.content.substring(0, 50) : 'Image Post'}...`;
                                item.onclick = () => {
                                    // Could open a modal or scroll to post, let's just go home
                                    showHomeView();
                                };
                                el.appendChild(item);
                            });
                        } else {
                            el.innerHTML = `<p class="text-muted">${emptyText}</p>`;
                        }
                    };
                    renderActivity(data.liked, 'activity-likes', 'No liked posts yet.');
                    renderActivity(data.commented, 'activity-comments', 'No comments yet.');
                    renderActivity(data.viewed, 'activity-views', 'No history yet.');
                }
            } catch (err) { console.error(err); }
        } else if (tabId === 'notifications') {
            container.innerHTML = '<h3>Notifications</h3><div id="settings-notifications-list">Loading...</div>';
            try {
                const res = await fetch(`/api/notifications?userId=${currentUserId}`);
                const data = await res.json();
                const list = document.getElementById('settings-notifications-list');
                list.innerHTML = '';
                let hasNotifs = false;

                if (data.success) {
                    // Similar logic to loadFriendRequests dropdown but rendered here
                    if (data.requests.length > 0) {
                        hasNotifs = true;
                        data.requests.forEach(req => {
                            const item = document.createElement('div');
                            item.className = 'notif-item';
                            item.style = 'background:rgba(255,255,255,0.05); padding:1rem; border-radius:0.8rem; margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center;';
                            item.innerHTML = `
                                <span>👤 Friend request from <b>${req.from.username}</b></span>
                                <button class="btn-primary btn-sm" onclick="window.acceptRequest('${req._id}', '${req.from._id}')">Accept</button>
                            `;
                            list.appendChild(item);
                        });
                    }
                    if (data.alerts.length > 0) {
                        hasNotifs = true;
                        data.alerts.forEach(alert => {
                            const item = document.createElement('div');
                            item.className = 'notif-item';
                            item.style = 'background:rgba(255,255,255,0.05); padding:1rem; border-radius:0.8rem; margin-bottom:0.8rem;';
                            let icon = '🔔';
                            let actionText = '';
                            if (alert.type === 'like') { icon = '❤️'; actionText = 'liked your post'; }
                            else if (alert.type === 'comment') { icon = '💬'; actionText = 'commented on your post'; }
                            else if (alert.type === 'repost') { icon = '🔁'; actionText = 'reposted your post'; }

                            item.innerHTML = `${icon} <b>${alert.from.username}</b> ${actionText}: <i>"${alert.post ? alert.post.content.substring(0, 30) : ''}..."</i>`;
                            list.appendChild(item);
                        });
                    }
                }
                if (!hasNotifs) {
                    list.innerHTML = '<p class="text-muted">No notifications.</p>';
                }
            } catch (err) { console.error(err); }
        }
    }

    // Notification Dropdown Toggle
    const notifBellBtn = document.getElementById('notif-bell-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    const notifList = document.getElementById('notif-list');
    const notifDot = document.getElementById('notif-dot');

    if (notifBellBtn) {
        notifBellBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
        };
    }

    document.addEventListener('click', () => {
        if (notifDropdown) notifDropdown.classList.add('hidden');
    });

    if (notifDropdown) {
        notifDropdown.onclick = (e) => e.stopPropagation();
    }
    document.getElementById('back-to-friends').onclick = () => showFriendsView();

    // Home Search Logic
    const homeSearchInput = document.getElementById('home-search-input');
    const homeSearchResultsDiv = document.getElementById('home-search-results');

    homeSearchInput.addEventListener('input', async () => {
        const query = homeSearchInput.value.trim();
        if (query.length < 2) {
            homeSearchResultsDiv.classList.add('hidden');
            homeSearchResultsDiv.innerHTML = '';
            return;
        }

        try {
            const res = await fetch(`/api/users/search?query=${query}&userId=${currentUserId}`);
            const data = await res.json();
            homeSearchResultsDiv.innerHTML = '';
            homeSearchResultsDiv.classList.remove('hidden');

            if (data.success && data.users.length > 0) {
                data.users.forEach(u => {
                    const card = document.createElement('div');
                    card.className = 'user-card';
                    card.style.background = 'rgba(255,255,255,0.02)';
                    const initial = u.username.charAt(0).toUpperCase();
                    const colors = ['#a855f7', '#ec4899', '#3b82f6'];
                    const bg = colors[u.username.length % colors.length];

                    const isFriend = u.friends && u.friends.some(fId => fId.toString() === currentUserId.toString());
                    const actionBtn = isFriend
                        ? `<button class="btn-sm" onclick="window.startChat('${u._id}', '${u.username}')" style="background:var(--primary-color);color:white">Chat</button>`
                        : `<button class="btn-sm" onclick="window.sendFriendRequest('${u._id}', this)">+ Friend</button>`;

                    card.innerHTML = `
                        <div class="user-info" onclick="window.viewUserProfile('${u._id}')" style="cursor:pointer">
                            <div class="avatar initial-avatar small" style="background:${bg}">${initial}</div>
                            <span style="font-size:0.9rem">${u.username}</span>
                        </div>
                        ${actionBtn}`;
                    homeSearchResultsDiv.appendChild(card);
                });
            } else {
                homeSearchResultsDiv.innerHTML = '<p class="text-muted" style="font-size:0.8rem">No users found.</p>';
            }
        } catch (err) { console.error(err); }
    });

    document.getElementById('back-to-friends').onclick = () => showFriendsView();

    async function loadMyFriends() {
        try {
            const res = await fetch(`/api/users/${currentUserId}/friends`);
            const data = await res.json();
            myFriendsGrid.innerHTML = '';
            if (data.success && data.friends.length > 0) {
                data.friends.forEach(friend => {
                    const card = document.createElement('div');
                    card.className = 'user-card';
                    const initial = friend.username.charAt(0).toUpperCase();
                    const colors = ['#a855f7', '#ec4899', '#3b82f6'];
                    const bg = colors[friend.username.length % colors.length];

                    card.innerHTML = `
                        <div class="user-info" onclick="viewUserProfile('${friend._id}')" style="cursor:pointer">
                            <div class="avatar initial-avatar" style="background:${bg}">${initial}</div>
                            <span>${friend.username}</span>
                        </div>
                        <button class="btn-sm" onclick="window.startChat('${friend._id}', '${friend.username}')">Message</button>
                    `;
                    myFriendsGrid.appendChild(card);
                });
            } else {
                myFriendsGrid.innerHTML = '<p class="text-muted">You have no friends yet.</p>';
            }
        } catch (err) { console.error(err); }
    }

    window.startChat = (friendId, friendName) => {
        showChatView(friendId, friendName);
    };

    // --- Chat Logic ---
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessagesArea = document.getElementById('chat-messages-area');
    const chatImageInput = document.getElementById('chat-image-input');
    const chatAttachBtn = document.getElementById('chat-attach-btn');
    const imagePreview = document.getElementById('image-preview-container');

    chatAttachBtn.onclick = () => chatImageInput.click();
    chatImageInput.onchange = () => {
        if (chatImageInput.files.length > 0) imagePreview.classList.remove('hidden');
    };
    document.getElementById('remove-img-preview').onclick = () => {
        chatImageInput.value = '';
        imagePreview.classList.add('hidden');
    };

    let currentReplyToId = null;

    async function loadMessages() {
        if (!activeChatFriendId) return;
        try {
            const res = await fetch(`/api/messages/${currentUserId}/${activeChatFriendId}`);
            const data = await res.json();
            if (data.success) {
                const isAtBottom = chatMessagesArea.scrollHeight - chatMessagesArea.scrollTop <= chatMessagesArea.clientHeight + 100;

                chatMessagesArea.innerHTML = '';
                data.messages.forEach(msg => {
                    const msgEl = document.createElement('div');
                    msgEl.className = `message-bubble ${msg.sender === currentUserId ? 'message-sent' : 'message-received'}`;

                    let contentHtml = '';
                    if (msg.replyTo) {
                        contentHtml += `<div class="reply-context" style="font-size:0.7rem; opacity:0.7; border-left:2px solid white; padding-left:5px; margin-bottom:5px;">
                            ${msg.replyTo.content ? msg.replyTo.content.substring(0, 30) + '...' : 'Image'}
                        </div>`;
                    }
                    let textContent = msg.content || '';
                    if (textContent.includes('http')) {
                        // Make links clickable
                        textContent = textContent.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:var(--primary-color); text-decoration:underline;">$1</a>');
                    }
                    contentHtml += `<p>${textContent}</p>`;
                    const msgMediaSource = msg.mediaUrl || msg.image;
                    if (msgMediaSource) {
                        if (msg.mediaType === 'video') {
                            contentHtml += `<video src="${msgMediaSource}" controls class="chat-video" style="max-width:200px; border-radius:0.5rem; margin-top:0.5rem;"></video>`;
                        } else {
                            contentHtml += `<img src="${msgMediaSource}" class="chat-image">`;
                        }
                    }
                    contentHtml += `<button class="btn-reply" style="background:none; border:none; cursor:pointer; font-size:0.7rem; color:inherit; opacity:0.5; margin-top:5px;" onclick="window.setReplyTo('${msg._id}', '${(msg.content || 'Image').substring(0, 20)}')">Reply</button>`;

                    msgEl.innerHTML = contentHtml;
                    chatMessagesArea.appendChild(msgEl);
                });

                if (isAtBottom) chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
            }
        } catch (err) { console.error(err); }
    }

    const replyIndicator = document.createElement('div');
    replyIndicator.id = 'reply-indicator';
    replyIndicator.className = 'hidden';
    replyIndicator.style = 'padding: 5px 10px; background: rgba(255,255,255,0.1); font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center;';
    chatView.querySelector('.chat-container').insertBefore(replyIndicator, chatForm);

    window.setReplyTo = (msgId, text) => {
        currentReplyToId = msgId;
        replyIndicator.innerHTML = `<span>Replying to: "${text}..."</span> <button onclick="window.clearReplyTo()">x</button>`;
        replyIndicator.classList.remove('hidden');
        chatInput.focus();
    };

    window.clearReplyTo = () => {
        currentReplyToId = null;
        replyIndicator.classList.add('hidden');
    };

    chatForm.onsubmit = async (e) => {
        e.preventDefault();
        const content = chatInput.value.trim();
        if (!content && chatImageInput.files.length === 0) return;

        const formData = new FormData();
        formData.append('sender', currentUserId);
        formData.append('receiver', activeChatFriendId);
        formData.append('content', content);
        if (chatImageInput.files[0]) formData.append('image', chatImageInput.files[0]);
        if (currentReplyToId) formData.append('replyTo', currentReplyToId);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                chatInput.value = '';
                chatImageInput.value = '';
                imagePreview.classList.add('hidden');
                window.clearReplyTo();
                loadMessages();
            }
        } catch (err) { console.error(err); }
    };

    // --- Profile System ---
    // Profile Tab Switching
    const tabPosts = document.getElementById('tab-posts');
    const tabReposts = document.getElementById('tab-reposts');
    const repostsView = document.getElementById('reposts-view');

    tabPosts.onclick = () => {
        tabPosts.classList.add('active');
        tabPosts.style.color = 'var(--primary-color)';
        tabPosts.style.borderBottom = '2px solid var(--primary-color)';
        tabReposts.classList.remove('active');
        tabReposts.style.color = 'var(--text-secondary)';
        tabReposts.style.borderBottom = 'none';
        document.getElementById('profile-posts-grid').classList.remove('hidden');
        repostsView.classList.add('hidden');
    };

    tabReposts.onclick = async () => {
        tabReposts.classList.add('active');
        tabReposts.style.color = 'var(--primary-color)';
        tabReposts.style.borderBottom = '2px solid var(--primary-color)';
        tabPosts.classList.remove('active');
        tabPosts.style.color = 'var(--text-secondary)';
        tabPosts.style.borderBottom = 'none';
        document.getElementById('profile-posts-grid').classList.add('hidden');
        repostsView.classList.remove('hidden');

        // Load Reposts
        repostsView.innerHTML = '<p class="text-muted">Loading reposts...</p>';
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            if (data.success) {
                const activeProfileId = profileView.getAttribute('data-userid');
                const repostedPosts = data.posts.filter(p => p.shares.some(sId => sId.toString() === activeProfileId));
                repostsView.innerHTML = '';
                if (repostedPosts.length > 0) {
                    repostedPosts.forEach(post => {
                        const card = renderPost(post);
                        repostsView.appendChild(card);
                    });
                } else {
                    repostsView.innerHTML = '<p class="text-muted" style="padding:1rem;">No reposts yet.</p>';
                }
            }
        } catch (err) { console.error(err); }
    };

    window.viewUserProfile = async (userId) => {
        userId = userId.toString();
        profileView.setAttribute('data-userid', userId);
        hideAllViews();
        profileView.classList.remove('hidden');
        tabPosts.click(); // Default to posts tab

        try {
            const res = await fetch(`/api/users/${userId}`);
            const data = await res.json();
            if (data.success) {
                const u = data.user;
                const colors = ['#a855f7', '#ec4899', '#3b82f6'];
                const bg = colors[u.username.length % colors.length];

                document.getElementById('profile-view-avatar').style.background = bg;
                document.getElementById('profile-view-avatar').textContent = u.username.charAt(0).toUpperCase();
                document.getElementById('profile-view-username').textContent = u.username;
                document.getElementById('profile-view-handle').textContent = '@' + u.username.toLowerCase();
                document.getElementById('profile-view-posts-count').textContent = u.postsCount || 0;
                document.getElementById('profile-view-friends-count').textContent = u.friends.length;

                const actionsDiv = document.getElementById('profile-view-actions');
                if (u._id === currentUserId) {
                    actionsDiv.innerHTML = '<button class="btn-primary">Edit Profile</button>';
                } else if (u.friends.some(fId => fId.toString() === currentUserId.toString())) {
                    actionsDiv.innerHTML = `<button class="btn-primary" onclick="window.startChat('${u._id}', '${u.username}')">Message</button>`;
                } else {
                    actionsDiv.innerHTML = `<button class="btn-primary" onclick="window.sendFriendRequest('${u._id}', this)">Add Friend</button>`;
                }

                // Load User Posts
                const postsGrid = document.getElementById('profile-posts-grid');
                postsGrid.innerHTML = '';
                const pRes = await fetch('/api/posts');
                const pData = await pRes.json();
                if (pData.success) {
                    const userPosts = pData.posts.filter(p => p.user._id === userId);
                    if (userPosts.length > 0) {
                        userPosts.forEach(post => {
                            // Create grid post card for profile
                            const gridCard = document.createElement('div');
                            gridCard.className = 'grid-post';
                            gridCard.onclick = () => window.openPostDetails(post._id);
                            
                            const mediaSource = post.mediaUrl || post.image;
                            if (mediaSource) {
                                if (post.mediaType === 'video') {
                                    gridCard.innerHTML = `
                                        <video src="${mediaSource}" muted playsinline></video>
                                        <img src="" class="grid-post-placeholder" style="display:none;">
                                    `;
                                } else {
                                    gridCard.innerHTML = `<img src="${mediaSource}" alt="Post">`;
                                }
                            } else {
                                gridCard.innerHTML = `<div class="grid-post-content">${post.content.substring(0, 50)}...</div>`;
                            }
                            
                            postsGrid.appendChild(gridCard);
                            // Observe for autoplay
                            videoObserver.observe(gridCard);
                        });
                    } else {
                        postsGrid.innerHTML = '<p class="text-muted">No posts yet.</p>';
                    }
                }
            }
        } catch (err) { console.error(err); }
    };

    // User Profile Click (Your Own)
    const userProfileSummary = document.querySelector('.user-profile-summary');
    if (userProfileSummary) {
        userProfileSummary.onclick = () => viewUserProfile(currentUserId);
    }

    // Initial Badge Logic and Polling
    async function loadFriendRequests() {
        if (!currentUserId) return;
        try {
            const res = await fetch(`/api/notifications?userId=${currentUserId}`);
            const data = await res.json();

            // Update Dropdown
            if (notifList) {
                notifList.innerHTML = '';
                let hasNotifs = false;

                // 1. Friend Requests
                if (data.success && data.requests.length > 0) {
                    hasNotifs = true;
                    data.requests.forEach(req => {
                        const item = document.createElement('div');
                        item.className = 'notif-item';
                        item.innerHTML = `
                            <div class="notif-text">👤 Friend request from <b>${req.from.username}</b></div>
                            <div class="notif-actions">
                                <button class="btn-primary btn-sm" onclick="window.acceptRequest('${req._id}', '${req.from._id}')">Accept</button>
                            </div>
                        `;
                        notifList.appendChild(item);
                    });
                }

                // 2. Interaction Alerts (Likes, Comments, Reposts)
                if (data.success && data.alerts && data.alerts.length > 0) {
                    hasNotifs = true;
                    data.alerts.forEach(alert => {
                        const item = document.createElement('div');
                        item.className = 'notif-item';
                        let icon = '🔔';
                        let actionText = '';
                        if (alert.type === 'like') { icon = '❤️'; actionText = 'liked your post'; }
                        else if (alert.type === 'comment') { icon = '💬'; actionText = 'commented on your post'; }
                        else if (alert.type === 'repost') { icon = '🔁'; actionText = 'reposted your post'; }

                        item.innerHTML = `
                            <div class="notif-text">${icon} <b>${alert.from.username}</b> ${actionText}: <i>"${alert.post ? alert.post.content.substring(0, 20) : ''}..."</i></div>
                        `;
                        notifList.appendChild(item);
                    });
                }

                if (hasNotifs) {
                    if (notifDot) notifDot.classList.remove('hidden');
                } else {
                    if (notifDot) notifDot.classList.add('hidden');
                    notifList.innerHTML = '<p class="text-muted" style="padding: 1.5rem; text-align: center;">No notifications</p>';
                }
            }
        } catch (err) { console.error(err); }
    }

    window.acceptRequest = async (requestId, fromId) => {
        try {
            const res = await fetch('/api/friends/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, requestId, fromId })
            });
            const data = await res.json();
            if (data.success) {
                loadFriendRequests();
                loadMyFriends();
            } else {
                alert(data.message);
            }
        } catch (err) { console.error(err); }
    };

    // Global Search updated
    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        try {
            const res = await fetch(`/api/users/search?query=${query}&userId=${currentUserId}`);
            const data = await res.json();
            searchResultsDiv.innerHTML = '';
            if (data.success && data.users.length > 0) {
                data.users.forEach(u => {
                    const card = document.createElement('div');
                    card.className = 'user-card';
                    const initial = u.username.charAt(0).toUpperCase();
                    const colors = ['#a855f7', '#ec4899', '#3b82f6'];
                    const bg = colors[u.username.length % colors.length];

                    // Check if already friends
                    const isFriend = u.friends && u.friends.some(fId => fId.toString() === currentUserId.toString());
                    const actionBtn = isFriend
                        ? `<button class="btn-sm" onclick="window.startChat('${u._id}', '${u.username}')">Message</button>`
                        : `<button class="btn-sm" onclick="window.sendFriendRequest('${u._id}', this)">Add Friend</button>`;

                    card.innerHTML = `
                        <div class="user-info" onclick="window.viewUserProfile('${u._id}')" style="cursor:pointer">
                            <div class="avatar initial-avatar" style="background:${bg}">${initial}</div>
                            <span>${u.username}</span>
                        </div>
                        ${actionBtn}`;
                    searchResultsDiv.appendChild(card);
                });
            } else { searchResultsDiv.innerHTML = '<p class="text-muted">No users found.</p>'; }
        } catch (err) { console.error(err); }
    });

    window.sendFriendRequest = async (toId, btn) => {
        try {
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromId: currentUserId, toId })
            });
            const data = await res.json();
            if (data.success) {
                btn.textContent = 'Requested';
                btn.disabled = true;
                btn.style.opacity = '0.5';
            } else {
                alert(data.message);
            }
        } catch (err) { console.error(err); }
    };

    window.openPostDetails = (postId) => {
        // Open post in modal or dedicated view if needed
        console.log('Post clicked:', postId);
        // Could implement a post detail modal here
    };

    setInterval(() => { if (currentUserId) loadFriendRequests(); }, 10000);
});
