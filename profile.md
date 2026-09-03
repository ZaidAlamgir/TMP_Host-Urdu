---
layout: authenticated
title: My Account - The Urdu Post
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js"></script>

<style>
    /* Your Original Styles */
    .profile-header-actions { margin-bottom: 1rem; display: flex; align-items: center; }
    .btn-back-smart { background: none; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 6px; color: #4b5563; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; text-decoration: none; }
    .btn-back-smart:hover { background-color: #f3f4f6; color: #1f2937; }
    .user-post-item { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .user-post-item .post-content { color: #374151; line-height: 1.6; margin-bottom: 1rem; }
    .user-post-item .post-details { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #6b7280; }
    .user-post-item .post-actions button { background: none; border: none; font-size: 1rem; color: #6b7280; cursor: pointer; padding: 5px; border-radius: 50%; width: 32px; height: 32px; transition: background-color 0.2s, color 0.2s; }
    .user-post-item .post-actions button:hover { background-color: #e5e7eb; color: #1f2937; }
    .post-edit-container .dynamic-block { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; background-color: #fff; position: relative; }
    .post-edit-container .dynamic-block h3 { font-size: 0.8rem; font-weight: 600; color: #4b5563; margin-bottom: 0.75rem; text-transform: uppercase; }
    .post-edit-container .dynamic-block textarea, .post-edit-container .dynamic-block input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; box-sizing: border-box; }
    .post-edit-container .dynamic-block textarea:focus, .post-edit-container .dynamic-block input:focus { border-color: #0073e6; box-shadow: 0 0 0 2px rgba(0, 115, 230, 0.2); outline: none; }
    .post-edit-container .dynamic-block input.headline-input { font-size: 1.25rem; font-weight: bold; }
    .post-edit-container .edit-actions-container { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
    .post-edit-container .btn-cancel { background: #eee; padding: 8px 12px; border-radius: 6px; font-weight: 600; border: none; cursor: pointer; }
    .post-edit-container .btn-save { background: #0073e6; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 600; border: none; cursor: pointer; }
    .edit-actions-container { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .delete-account-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
    .delete-account-section h2 { color: #dc2626; font-size: 1.5rem; margin-bottom: 0.5rem; }
    .delete-account-section p { font-size: 0.9rem; color: #606770; margin-bottom: 1rem; }
    .btn-danger { background-color: #dc2626; color: white; padding: 10px 18px; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: background-color 0.3s; }
    .btn-danger:hover { background-color: #b91c1c; }
    .message { padding: 0.75rem; border-radius: 6px; margin-top: 1rem; font-weight: 500; font-size: 0.9rem; display: none; }
    .message.success { background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .message.error { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .message.info { background-color: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Required for Tabs to hide/show */
    .profile-view { display: none; }
    .profile-view.active { display: block; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* New CMS Styles */
    .dynamic-content-block { border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 3.5rem 1.25rem 1.5rem 1.25rem; margin-top: 1.5rem; background-color: #ffffff; position: relative; }
    .drag-handle { position: absolute; top: 0; left: 0; width: 100%; height: 2.5rem; display: flex; align-items: center; justify-content: center; cursor: grab; color: #94a3b8; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; border-radius: 0.75rem 0.75rem 0 0; }
    .remove-block-btn { position: absolute; top: 1.25rem; transform: translateY(-50%); right: 0.75rem; width: 1.75rem; height: 1.75rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ef4444; cursor: pointer; border: none; background: none; z-index: 20; }
    .rich-editor-wrapper { border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #fff; overflow: hidden; margin-bottom: 0.5rem; }
    .rich-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .rich-content-area { min-height: 80px; padding: 0.75rem; outline: none; line-height: 1.6; color: #334155; overflow-y: auto; }
    .rich-content-area.headline-editor { min-height: 60px; font-size: 1.25rem; font-weight: 700; line-height: 1.3; }
    .rich-content-area:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }
    .tag-suggestions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
    .tag-chip, .country-chip { font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.85rem; border-radius: 9999px; cursor: pointer; border: 1px solid transparent; }
    .tag-chip { background-color: #f1f5f9; color: #475569; }
    .country-chip { background-color: #ecfdf5; color: #047857; border-color: #6ee7b7; }
    .country-list-scroll { max-height: 220px; overflow-y: auto; padding: 4px; border: 1px solid #f1f5f9; background: #f8fafc; border-radius: 0.5rem; }
    .tool-btn { padding: 5px 8px; border-radius: 4px; border: 1px solid transparent; cursor: pointer; color: #475569; font-size: 0.8rem; background: white; border-color: #cbd5e1; display: flex; align-items: center; gap: 4px; }
    .link-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(15, 23, 42, 0.4); z-index: 1000; display: flex; justify-content: center; align-items: flex-start; padding-top: 15vh; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
    .link-modal-overlay.visible { opacity: 1; pointer-events: all; }
    .link-modal-content { background-color: white; padding: 2rem; border-radius: 1rem; width: 90%; max-width: 500px; }
</style>

<div class="profile-container-wrapper" style="display: none;">
    <div class="profile-layout">
        <nav class="profile-nav">
             <div class="profile-header-actions">
                <button id="smart-back-btn" class="btn-back-smart">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
            </div>
            
            <h3 id="welcome-name">Welcome</h3>
            <ul>
                <li><a href="#" class="nav-link active" data-view="profile-view" title="Profile"><i class="fas fa-user fa-fw"></i> <span>Profile</span></a></li>
                <li><a href="#" class="nav-link" data-view="my-posts-view" title="My Posts"><i class="fas fa-newspaper fa-fw"></i> <span>My Posts</span></a></li>
                
                <li id="nav-writer-panel" style="display: none;">
                    <a href="#" class="nav-link" data-view="writer-view" title="Writer Panel"><i class="fas fa-pen-nib fa-fw"></i> <span style="color: #4f46e5; font-weight: bold;">Writer Panel</span></a>
                </li>
                
                <li><a href="#" class="nav-link" data-view="security-view" title="Security"><i class="fas fa-shield-alt fa-fw"></i> <span>Security</span></a></li>
                <li><a href="#" id="sign-out-btn" title="Sign Out"><i class="fas fa-sign-out-alt fa-fw"></i> <span>Sign Out</span></a></li>
            </ul>
        </nav>
        <main class="profile-content">
            <div id="profile-view" class="profile-view active">
                <h2>My Profile</h2>
                <form id="profileForm">
                    <div class="form-group"><label for="fullName">Full Name</label><input type="text" id="fullName" name="fullName"></div>
                    <div class="form-group"><label for="email">Email Address</label><input type="email" id="email" name="email" disabled></div>
                    <button type="submit" class="btn-primary">Update Name</button>
                    <div id="profileMessage" class="message"></div>
                </form>
            </div>
            <div id="security-view" class="profile-view">
                <h2>Security Settings</h2>
                <div class="form-group">
                    <label>Password</label>
                    <p style="font-size: 0.9rem; color: #606770; margin: 0;">Click the button below to send a password reset link to your email.</p>
                </div>
                <button id="resetPasswordBtn" class="btn-primary">Send Password Reset Email</button>
                <div id="securityMessage" class="message"></div>

                <div class="delete-account-section">
                    <h2>Delete Account</h2>
                    <p>Permanently delete your account and all associated data (posts, profile). This action cannot be undone.</p>
                    <button id="deleteAccountBtn" class="btn-danger">Delete My Account</button>
                    <div id="deleteMessage" class="message"></div>
                </div>
            </div>
            <div id="my-posts-view" class="profile-view">
                <h2>My Posts</h2>
                <div id="my-posts-list"></div>
            </div>

            <div id="writer-view" class="profile-view">
                <h2 style="color: #4f46e5; margin-bottom: 5px;">Author CMS</h2>
                <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 20px;">Create and publish articles directly to the news feed.</p>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="font-size: 0.75rem; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Headline</label>
                    <div id="article-headline-container"></div> 
                    <label style="font-size: 0.75rem; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-top: 1rem; display: block;">Subheadline</label>
                    <div id="article-subheadline-container"></div> 
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div><label style="font-size: 0.85rem; font-weight: 500;">Main Image URL</label><input type="text" id="article-main-image-url" style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.5rem;" placeholder="https://media.tmpnews.com/images/..."></div>
                    <div><label style="font-size: 0.85rem; font-weight: 500;">Author Name</label><input type="text" id="article-author" style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: #f3f4f6;" readonly></div>
                </div>
                 
                <div style="margin-bottom: 2rem;">
                    <label style="font-size: 0.85rem; font-weight: 500;">Image Description</label>
                    <div id="article-main-image-desc-container"></div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="font-size: 0.9rem; font-weight: bold; color: #1e293b;">Article Body</label>
                    <div id="article-p1-container"></div>
                </div>

                <div id="dynamic-content-blocks"></div>

                <div style="margin: 2rem 0; padding: 1.5rem; background: #f8fafc; border-radius: 0.5rem; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <select id="block-type-select" style="padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.3rem;">
                        <option value="paragraph">Paragraph</option>
                        <option value="headline-h2">Headline (H2)</option>
                        <option value="headline-h3">Headline (H3)</option>
                        <option value="image">Image Block</option>
                        <option value="quote">Quote</option>
                        <option value="twitter">Twitter Embed</option>
                        <option value="youtube">YouTube Embed</option>
                    </select>
                    <button id="add-block-button" style="background: #1e293b; color: white; padding: 0.5rem 1rem; border-radius: 0.3rem; border: none; cursor: pointer;">
                        <i class="fas fa-plus"></i> Add Block
                    </button>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="font-size: 0.85rem; font-weight: 500;">Tags (comma separated)</label>
                    <input type="text" id="article-tags" style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.5rem;" placeholder="e.g., politics, world">
                    <div id="tag-suggestions-container" class="tag-suggestions">
                        <div class="tag-chip" data-tag="Breaking">Breaking</div>
                        <div class="tag-chip" data-tag="World">World</div>
                        <div class="tag-chip" data-tag="Politics">Politics</div>
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <p style="font-size: 0.75rem; font-weight: bold; color: #047857; text-transform: uppercase;">OIC Member Countries</p>
                        <input type="text" id="country-search-input" style="padding: 0.3rem 0.5rem; font-size: 0.8rem; border: 1px solid #6ee7b7; border-radius: 0.3rem;" placeholder="Search country...">
                    </div>
                    <div id="country-suggestions-container" class="tag-suggestions country-list-scroll"></div>
                </div>

                <button id="publish-button" style="width: 100%; background: #4f46e5; color: white; font-weight: bold; padding: 1rem; border-radius: 0.5rem; border: none; font-size: 1.1rem; cursor: pointer;">
                    <span id="publish-text">Publish to User Posts</span>
                </button>
                <div id="publish-status-message" class="message" style="text-align: center; margin-top: 10px;"></div>
            </div>
        </main>
    </div>
</div>

<div id="link-modal" class="link-modal-overlay">
    <div class="link-modal-content">
         <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Add Link</h3>
         <input type="text" id="link-url-input" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; margin-bottom: 1rem;" placeholder="https://example.com">
         <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
             <button id="cancel-link-btn" style="padding: 0.6rem 1.2rem; border-radius: 0.5rem; background: #f3f4f6; border: none; cursor: pointer;">Cancel</button>
             <button id="add-link-btn" style="padding: 0.6rem 1.2rem; border-radius: 0.5rem; background: #4f46e5; color: white; border: none; cursor: pointer;">Add Link</button>
         </div>
    </div>
</div>

<script>
    const SUPABASE_URL = 'https://yfrqnghduttudqbnodwr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnFuZ2hkdXR0dWRxYm5vZHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDc3MTgsImV4cCI6MjA3NDEyMzcxOH0.i7JCX74CnE7pvZnBpCbuz6ajmSgIlA9Mx0FhlPJjzxU';

    document.addEventListener('turbo:load', () => {
        let supabase;
          if (window.supabaseClient) {
         supabase = window.supabaseClient;
            } else {
         supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
             window.supabaseClient = supabase;
        }
        const basePath = document.body.getAttribute('data-base-path') || '';

        let isProfileInitialized = false;
        let currentUser = null; 

        // CMS Globals
        window.cmsInitialized = false;
        window.isWriter = false;
        let activeContentEditable = null;

        // Immediate cache check
        const cachedUserStr = localStorage.getItem('tmp_cached_user_details');
        if (cachedUserStr) {
            const cachedUser = JSON.parse(cachedUserStr);
            populateProfileFields(cachedUser.full_name, cachedUser.email);
            document.querySelector('.profile-container-wrapper').style.display = 'block';
        }

        supabase.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user; 
            if (currentUser) {
                const fullName = currentUser.user_metadata?.full_name || '';
                const email = currentUser.email || '';
                localStorage.setItem('tmp_cached_user_details', JSON.stringify({ full_name: fullName, email: email }));
                
                if (typeof initializeSupabaseHeader === 'function') {
                    initializeSupabaseHeader(basePath, true);
                }

                // ==========================================
                // NEW: SILENT BACKGROUND ROLE CHECK
                // ==========================================
                supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle()
                    .then(({data, error}) => {
                        if (data && data.role === 'writer') {
                            document.getElementById('nav-writer-panel').style.display = 'block';
                            document.getElementById('article-author').value = fullName || email.split('@')[0];
                            window.isWriter = true;
                        }
                    });
                // ==========================================

                if (!isProfileInitialized) {
                    initializeProfilePage(currentUser, supabase, basePath);
                    isProfileInitialized = true;
                }
                document.querySelector('.profile-container-wrapper').style.display = 'block';
            } else {
                window.location.replace(`${basePath}/auth.html`);
                isProfileInitialized = false; 
                localStorage.removeItem('tmp_cached_user_details');
            }
        });

        function populateProfileFields(name, email) {
            const welcomeName = document.getElementById('welcome-name');
            const fullNameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('email');
            if(welcomeName) welcomeName.textContent = `Welcome, ${name || email}`;
            if(fullNameInput) fullNameInput.value = name || '';
            if(emailInput) emailInput.value = email || '';
        }

        function initializeProfilePage(user, supabase, basePath) {
            if (!user) return;
            const profileForm = document.getElementById('profileForm');
            const resetPasswordBtn = document.getElementById('resetPasswordBtn');
            const signOutBtn = document.getElementById('sign-out-btn');
            const profileMessage = document.getElementById('profileMessage');
            const securityMessage = document.getElementById('securityMessage');
            const navLinks = document.querySelectorAll('.nav-link');
            const views = document.querySelectorAll('.profile-view');
            const deleteAccountBtn = document.getElementById('deleteAccountBtn');
            const deleteMessage = document.getElementById('deleteMessage');
            const backBtn = document.getElementById('smart-back-btn');

            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (document.referrer && document.referrer.indexOf(window.location.host) !== -1) history.back();
                else window.location.href = `${basePath}/`;
            });

            populateProfileFields(user.user_metadata?.full_name, user.email);

            navLinks.forEach(link => link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.id === 'sign-out-btn') return;
                const targetViewId = link.getAttribute('data-view');
                
                if (targetViewId === 'my-posts-view') loadUserPosts(user, supabase); 
                
                // ==========================================
                // NEW: TRIGGER CMS SETUP ONLY WHEN CLICKED
                // ==========================================
                if (targetViewId === 'writer-view' && !window.cmsInitialized) {
                    initStaticEditors();
                    window.cmsInitialized = true;
                }

                views.forEach(view => view.classList.remove('active'));
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                document.getElementById(targetViewId).classList.add('active');
                link.classList.add('active');
            }));

            const myPostsList = document.getElementById('my-posts-list');
            
            myPostsList.addEventListener('click', async (e) => {
                const target = e.target;
                const postItem = target.closest('.user-post-item');
                if (!postItem) return;
                const postId = postItem.dataset.postId;
                const currentUserId = currentUser?.id;

                if (target.closest('.btn-delete')) {
                    if (!postId) return;
                    if (confirm('Are you sure you want to permanently delete this post?')) {
                        const { error } = await supabase.from('user_posts').delete().eq('id', postId).eq('user_id', currentUserId);
                        if (error) alert(`Error deleting post: ${error.message}`);
                        else {
                            postItem.style.transition = 'opacity 0.3s ease';
                            postItem.style.opacity = '0';
                            setTimeout(() => postItem.remove(), 300);
                            invalidatePostsCache(currentUserId);
                        }
                    }
                }
                else if (target.closest('.btn-edit')) {
                    const contentDisplay = postItem.querySelector('.post-content-display');
                    if (postItem.querySelector('.post-edit-container') && postItem.querySelector('.post-edit-container').style.display !== 'none') return;
                    let editContainer = postItem.querySelector('.post-edit-container');
                    if (!editContainer) {
                        editContainer = document.createElement('div');
                        editContainer.className = 'post-edit-container';
                        editContainer.style.display = 'none';
                        postItem.appendChild(editContainer);
                    }
                    const originalContentHTML = contentDisplay.querySelector('.post-content').innerHTML;
                    let formHTML = '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = originalContentHTML;
                    Array.from(tempDiv.children).forEach(node => {
                        const type = node.tagName.toLowerCase();
                        if (type === 'p') formHTML += `<div class="dynamic-block" data-block-type="paragraph"><h3>Paragraph</h3><textarea rows="5">${node.textContent}</textarea></div>`;
                        else if (type === 'blockquote') formHTML += `<div class="dynamic-block" data-block-type="quote"><h3>Quote</h3><textarea rows="3">${node.textContent}</textarea></div>`;
                        else if (type === 'h3') formHTML += `<div class="dynamic-block" data-block-type="headline"><h3>Headline</h3><input type="text" class="headline-input" value="${node.textContent}"></div>`;
                        else if (type === 'img') formHTML += `<div class="dynamic-block" data-block-type="image"><h3>Image URL</h3><input type="text" value="${node.src}"></div>`;
                    });
                    if (formHTML === '') formHTML += `<div class="dynamic-block" data-block-type="paragraph"><h3>Paragraph</h3><textarea rows="5">${tempDiv.textContent.trim()}</textarea></div>`;

                    editContainer.innerHTML = `${formHTML}<div class="edit-actions-container"><button class="btn-cancel">Cancel</button><button class="btn-save">Save</button></div>`;
                    contentDisplay.style.display = 'none';
                    editContainer.style.display = 'block';
                }
                else if (target.closest('.btn-save')) {
                    const editContainer = postItem.querySelector('.post-edit-container');
                    const newContent = Array.from(editContainer.querySelectorAll('.dynamic-block')).map(block => {
                        const type = block.dataset.blockType;
                        const value = block.querySelector('input, textarea').value.trim();
                        if (type === 'image') return `![Image](${value})`; 
                        if (type === 'quote') return `> ${value}`;
                        if (type === 'headline') return `## ${value}`; 
                        return value;
                    }).filter(v => v).join('\n\n');

                    const { error } = await supabase.from('user_posts').update({ content: newContent }).eq('id', postId).eq('user_id', currentUserId);
                    if (error) alert(`Error updating post: ${error.message}`);
                    else {
                        invalidatePostsCache(currentUserId);
                        loadUserPosts(currentUser, supabase, true);
                    }
                }
                else if (target.closest('.btn-cancel')) {
                    postItem.querySelector('.post-edit-container').innerHTML = '';
                    postItem.querySelector('.post-edit-container').style.display = 'none';
                    postItem.querySelector('.post-content-display').style.display = 'block';
                }
            });

            function parseContentToHTML(content) {
                 let html = '';
                 if (content) {
                     content.split('\n\n').forEach(part => {
                         const trimmedPart = part.trim();
                         if (trimmedPart.startsWith('![')) {
                             const url = trimmedPart.match(/\((.*?)\)/)?.[1];
                             if (url) html += `<img src="${url}" style="max-width: 100%; border-radius: 8px; margin: 0.5rem 0;">`;
                         } else if (trimmedPart.startsWith('>')) {
                             html += `<blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 0.5rem 0; font-style: italic;">${trimmedPart.substring(1).trim()}</blockquote>`;
                         } else if (trimmedPart.startsWith('## ')) {
                             html += `<h3 style="font-size: 1.2rem; font-weight: bold;">${trimmedPart.substring(3).trim()}</h3>`;
                         } else if (trimmedPart){ 
                             html += `<p>${trimmedPart.replace(/\n/g, '<br>')}</p>`;
                         }
                     });
                 }
                 return html || '<p><em>(Empty Post)</em></p>';
            }

            function getCacheKey(userId) { return `user_posts_${userId}`; }
            function invalidatePostsCache(userId) { localStorage.removeItem(getCacheKey(userId)); }

            async function loadUserPosts(userForPosts, supabaseInstance, forceRefresh = false) { 
                const postsList = document.getElementById('my-posts-list');
                const cacheKey = getCacheKey(userForPosts.id);
                
                if (!forceRefresh) {
                    const cachedData = localStorage.getItem(cacheKey);
                    if (cachedData) {
                        const { posts, timestamp } = JSON.parse(cachedData);
                        if (Date.now() - timestamp < 300000) { 
                            renderPosts(posts, postsList);
                            return;
                        }
                    }
                }
                postsList.innerHTML = '<div class="loader"></div>'; 
                
                // Fetch from BOTH tables simultaneously
                const [activeRes, archiveRes] = await Promise.all([
                    supabaseInstance.from('user_posts').select('*').eq('user_id', userForPosts.id),
                    supabaseInstance.from('post_to_webpage').select('*').eq('user_id', userForPosts.id)
                ]);

                if (activeRes.error) console.error("Error loading active posts:", activeRes.error);
                if (archiveRes.error) console.error("Error loading archived posts:", archiveRes.error);

                let combinedPosts = [];

                // Format active posts
                if (activeRes.data) {
                    combinedPosts.push(...activeRes.data.map(p => ({ 
                        ...p, 
                        isArchived: false, 
                        sortDate: new Date(p.created_at).getTime() 
                    })));
                }

                // Format archived posts
                if (archiveRes.data) {
                    combinedPosts.push(...archiveRes.data.map(p => ({ 
                        ...p, 
                        isArchived: true, 
                        sortDate: new Date(p.archived_at).getTime() 
                    })));
                }

                // Sort newest to oldest
                combinedPosts.sort((a, b) => b.sortDate - a.sortDate);

                localStorage.setItem(cacheKey, JSON.stringify({ posts: combinedPosts, timestamp: Date.now() }));
                renderPosts(combinedPosts, postsList);
            }

            function renderPosts(posts, container) {
                if (!posts || posts.length === 0) { 
                    container.innerHTML = `<p>You haven't created any posts yet.</p>`; 
                    return; 
                }
                
                container.innerHTML = posts.map(post => {
                    // RENDERING FOR ARCHIVED/PUBLISHED POSTS
                    if (post.isArchived) {
                        return `
                        <div class="user-post-item" style="border-left: 4px solid #10b981; background: #f8fafc;">
                            <div class="post-content">
                                <h3 style="font-size: 1.1rem; font-weight: bold; color: #1e293b; margin-bottom: 0.5rem;">${post.headline || 'Untitled Article'}</h3>
                                <span style="display: inline-block; background: #d1fae5; color: #047857; font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 9999px;">
                                    <i class="fas fa-check-circle"></i> Published to D1
                                </span>
                            </div>
                            <div class="post-details" style="display: block; margin-top: 15px;">
                                <div style="margin-bottom: 12px;">
                                    <a href="${post.web_link}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; color: #4f46e5; text-decoration: none; font-weight: 600; font-size: 0.9rem;">
                                        <i class="fas fa-external-link-alt"></i> View Live Article
                                    </a>
                                </div>
                                <div style="font-size: 0.8rem; color: #475569; background: #f1f5f9; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    <i class="fas fa-info-circle text-indigo-500 mr-1"></i> 
                                    This article has been permanently archived to the main database. To request edits or deletion, please contact 
                                    <a href="mailto:admin@tmpnews.com" style="color: #4f46e5; font-weight: 600;">admin@tmpnews.com</a>.
                                </div>
                                <div style="margin-top: 8px; font-size: 0.75rem; color: #94a3b8;">
                                    Archived on ${new Date(post.archived_at).toLocaleString()}
                                </div>
                            </div>
                        </div>`;
                    } 
                    // RENDERING FOR ACTIVE POSTS (Under 20 mins)
                    else {
                        const contentHTML = parseContentToHTML(post.content);
                        return `
                        <div class="user-post-item" data-post-id="${post.id}">
                            <div class="post-content-display">
                                <span style="display: inline-block; background: #fef3c7; color: #047857; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-bottom: 8px; border: 1px solid #fcd34d;">
                                    <i class="fas fa-clock"></i> Active Draft (Editable)
                                </span>
                                <div class="post-content">${contentHTML}</div>
                                <div class="post-details">
                                    <span class="post-date">Posted on ${new Date(post.created_at).toLocaleString()}</span>
                                    <div class="post-actions">
                                        <button class="btn-edit" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                                        <button class="btn-delete" title="Delete"><i class="fas fa-trash-alt"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="post-edit-container" style="display: none;"></div>
                        </div>`;
                    }
                }).join('');
            }

            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newName = document.getElementById('fullName').value.trim();
                const currentMetaName = user.user_metadata?.full_name || '';
                if (newName && newName !== currentMetaName) {
                    const { data, error } = await supabase.auth.updateUser({ data: { full_name: newName } });
                    if (error) showMessage(profileMessage, `Error: ${error.message}`, 'error');
                    else {
                        showMessage(profileMessage, 'Name updated!', 'success');
                        document.getElementById('welcome-name').textContent = `Welcome, ${newName}`;
                        localStorage.setItem('tmp_cached_user_details', JSON.stringify({ full_name: newName, email: user.email }));
                    }
                }
            });
            resetPasswordBtn.addEventListener('click', async () => {
                if (!user.email) return;
                const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}${basePath}/auth.html?view=update-password` });
                if (error) showMessage(securityMessage, `Error: ${error.message}`, 'error');
                else showMessage(securityMessage, 'Reset email sent.', 'success');
            });
            signOutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await supabase.auth.signOut();
                localStorage.clear();
                window.location.href = basePath + '/';
            });
            deleteAccountBtn.addEventListener('click', async () => {
                if (!confirm('Are you absolutely sure?')) return;
                showMessage(deleteMessage, 'Deleting...', 'info');
                try {
                    const { data, error: functionError } = await supabase.functions.invoke('delete-user-account');
                    if (functionError) throw functionError;
                    await supabase.auth.signOut();
                    localStorage.clear();
                    window.location.href = `${basePath}/`;
                } catch (error) { showMessage(deleteMessage, `Error: ${error.message}`, 'error'); }
            });
            function showMessage(element, text, type) {
                element.textContent = text;
                element.className = `message ${type}`;
                element.style.display = 'block';
                setTimeout(() => { if (element) element.style.display = 'none'; }, 3000);
            }

            // ==========================================
            // NEW: CMS EDITOR FUNCTIONS & EVENT LISTENERS
            // ==========================================
            window.formatText = function(cmd, value = null) {
                document.execCommand(cmd, false, value);
                if (activeContentEditable) activeContentEditable.focus();
            };

            function renderRichEditor(id, placeholder, value, customClass = '') {
                return `
                <div class="rich-editor-wrapper">
                    <div class="rich-toolbar">
                        <button class="tool-btn" onmousedown="event.preventDefault(); window.formatText('bold')" title="Bold"><i class="fas fa-bold"></i></button>
                        <button class="tool-btn" onmousedown="event.preventDefault(); window.formatText('italic')" title="Italic"><i class="fas fa-italic"></i></button>
                        <button class="tool-btn" onmousedown="event.preventDefault(); window.showLinkModal()" title="Link"><i class="fas fa-link"></i></button>
                    </div>
                    <div id="${id}" class="rich-content-area ${customClass}" contenteditable="true" data-placeholder="${placeholder}">${value || ''}</div>
                </div>`;
            }

            function initStaticEditors() {
                document.getElementById('article-headline-container').innerHTML = renderRichEditor('article-headline', 'Main Headline', '', 'headline-editor');
                document.getElementById('article-subheadline-container').innerHTML = renderRichEditor('article-subheadline', 'Subheadline', '', 'subheadline-editor');
                document.getElementById('article-main-image-desc-container').innerHTML = renderRichEditor('article-main-image-desc', 'Image Description', '', 'caption-editor');
                document.getElementById('article-p1-container').innerHTML = renderRichEditor('article-p1', 'Start writing your article...', '');

                if(typeof Sortable !== 'undefined') {
                    Sortable.create(document.getElementById('dynamic-content-blocks'), { animation: 150, handle: '.drag-handle', ghostClass: 'sortable-ghost' });
                }
                
                const oicCountriesList = ["Afghanistan", "Albania", "Algeria", "Azerbaijan", "Bahrain", "Bangladesh", "Egypt", "Indonesia", "Iran", "Iraq", "Malaysia", "Morocco", "Nigeria", "Pakistan", "Palestine", "Qatar", "Saudi Arabia", "Turkey", "United Arab Emirates"];
                const tagsInput = document.getElementById('article-tags');
                
                window.renderCountries = function(filterText = '') {
                    const countryContainer = document.getElementById('country-suggestions-container');
                    countryContainer.innerHTML = ''; 
                    const filtered = oicCountriesList.filter(c => c.toLowerCase().includes(filterText.toLowerCase()));
                    filtered.forEach(country => {
                        const chip = document.createElement('div');
                        chip.className = 'country-chip'; 
                        chip.textContent = country;
                        chip.onclick = () => {
                            const currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
                            if (!currentTags.includes(country)) tagsInput.value = tagsInput.value ? `${tagsInput.value}, ${country}` : country;
                        };
                        countryContainer.appendChild(chip);
                    });
                };
                window.renderCountries();
            }

            function createBlockHTML(blockType, blockId) {
                let html = `<div class="drag-handle"><i class="fas fa-grip-vertical"></i></div><button onclick="document.getElementById('${blockId}').remove();" class="remove-block-btn"><i class="fas fa-times"></i></button>`;
                switch (blockType) {
                    case 'paragraph': html += renderRichEditor(`${blockId}-editor`, 'Paragraph...', ''); break;
                    case 'headline-h2': html += `<h3 style="font-size:0.8rem;color:#94a3b8;margin-bottom:5px;">H2 Headline</h3>` + renderRichEditor(`${blockId}-editor`, 'Heading...', '', 'headline-editor'); break;
                    case 'headline-h3': html += `<h3 style="font-size:0.8rem;color:#94a3b8;margin-bottom:5px;">H3 Headline</h3>` + renderRichEditor(`${blockId}-editor`, 'Heading...', '', 'headline-editor'); break;
                    case 'image': html += `<div style="margin-bottom:10px;"><label style="font-size:0.8rem;">Image URL</label><input type="text" class="dynamic-image-url" style="width:100%;padding:5px;border:1px solid #cbd5e1;border-radius:4px;"></div><label style="font-size:0.8rem;">Caption</label>` + renderRichEditor(`${blockId}-desc`, 'Caption...', '', 'caption-editor'); break;
                    case 'quote': html += `<h3 style="font-size:0.8rem;color:#94a3b8;margin-bottom:5px;">Blockquote</h3>` + renderRichEditor(`${blockId}-quote`, 'Quote...', ''); break;
                    default: html += `<div style="margin-bottom:10px;"><label style="font-size:0.8rem;">${blockType} URL</label><input type="text" class="dynamic-social-url" style="width:100%;padding:5px;border:1px solid #cbd5e1;border-radius:4px;"></div>`;
                }
                return html;
            }

            document.getElementById('add-block-button').addEventListener('click', () => {
                const type = document.getElementById('block-type-select').value;
                const blockId = `block-${Date.now()}`;
                const div = document.createElement('div');
                div.className = 'dynamic-content-block';
                div.id = blockId;
                div.dataset.blockType = type;
                div.innerHTML = createBlockHTML(type, blockId);
                document.getElementById('dynamic-content-blocks').appendChild(div);
            });

            document.getElementById('country-search-input').addEventListener('input', (e) => window.renderCountries && window.renderCountries(e.target.value));
            
            document.getElementById('tag-suggestions-container').addEventListener('click', (e) => {
                if(e.target.classList.contains('tag-chip')) {
                    const tag = e.target.dataset.tag;
                    const tagsInput = document.getElementById('article-tags');
                    const currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
                    if (!currentTags.includes(tag)) tagsInput.value = tagsInput.value ? `${tagsInput.value}, ${tag}` : tag;
                }
            });

            const linkModal = document.getElementById('link-modal');
            const linkUrlInput = document.getElementById('link-url-input');
            window.showLinkModal = function(url='') { linkUrlInput.value = url; linkModal.classList.add('visible'); linkUrlInput.focus(); }
            
            document.getElementById('add-link-btn').onclick = () => {
                if(activeContentEditable) {
                    activeContentEditable.focus();
                    document.execCommand('createLink', false, linkUrlInput.value);
                }
                linkModal.classList.remove('visible');
            };
            document.getElementById('cancel-link-btn').onclick = () => linkModal.classList.remove('visible');
            document.addEventListener('focusin', (e) => { if(e.target.isContentEditable) activeContentEditable = e.target; });

            document.getElementById('publish-button').addEventListener('click', async () => {
                if(!window.isWriter) return;
                
                const publishBtn = document.getElementById('publish-button');
                const statusMessage = document.getElementById('publish-status-message');
                const headline = document.getElementById('article-headline').innerHTML;
                const p1 = document.getElementById('article-p1').innerHTML;
                
                if(!headline || !p1) { showMessage(statusMessage, 'Headline and Body required.', 'error'); return; }

                publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
                publishBtn.disabled = true;

                let fullContent = `<div class="article-body"><div class="paragraph">${p1}</div>`;
                document.querySelectorAll('.dynamic-content-block').forEach(block => {
                    const type = block.dataset.blockType;
                    if(type === 'paragraph') fullContent += `<div class="paragraph">${block.querySelector('.rich-content-area').innerHTML}</div>`;
                    else if(type.startsWith('headline')) {
                        const level = type === 'headline-h2' ? 'h2' : 'h3';
                        fullContent += `<${level}>${block.querySelector('.rich-content-area').innerHTML}</${level}>`;
                    } else if(type === 'image') {
                        const url = block.querySelector('.dynamic-image-url').value;
                        const desc = block.querySelector('.rich-content-area').innerHTML;
                        if(url) fullContent += `<figure><img src="${url}" alt="Article Image"><figcaption>${desc}</figcaption></figure>`;
                    } else if(type === 'quote') {
                        fullContent += `<blockquote>${block.querySelector('.rich-content-area').innerHTML}</blockquote>`;
                    } else {
                        const url = block.querySelector('.dynamic-social-url').value;
                        if(url) fullContent += `<div class="embed-link"><a href="${url}">External Content (${type})</a></div>`;
                    }
                });
                fullContent += `</div>`;

                const payload = {
                    user_id: currentUser.id,
                    headline: headline,
                    content: fullContent,
                    tags: document.getElementById('article-tags').value.split(',').map(t=>t.trim()).filter(t=>t),
                    media_url: document.getElementById('article-main-image-url').value || null,
                    link: null, 
                    web_link: null
                };

                const { error } = await supabase.from('user_posts').insert(payload);

                publishBtn.innerHTML = '<span id="publish-text">Publish to User Posts</span>';
                publishBtn.disabled = false;

                if (error) {
                    showMessage(statusMessage, `Error publishing: ${error.message}`, 'error');
                } else {
                    showMessage(statusMessage, 'Article Published!', 'success');
                    invalidatePostsCache(currentUser.id);
                    document.getElementById('article-headline').innerHTML = '';
                    document.getElementById('article-subheadline').innerHTML = '';
                    document.getElementById('article-p1').innerHTML = '';
                    document.getElementById('dynamic-content-blocks').innerHTML = '';
                    setTimeout(() => { document.querySelector('[data-view="my-posts-view"]').click(); }, 1000);
                }
            });
        } 
    }); 
</script>