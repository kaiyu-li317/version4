//7/21 新增右上角语言切换功能
function toggleLanguage() {
  const current = localStorage.getItem('lang') || 'zh';
  const next    = current === 'zh' ? 'en' : 'zh';
  setLang(next);
  localStorage.setItem('lang', next);
}

// 语音切换对照
const langDict = {
  en: {
    lang:"🌐Eng",
    home: "Home",
    user: "User Center",
    weekly: "Weekly Ranking",
    settings: "Settings",
    login: "Login/Register",
    logout: "Logout",
    comment: "Comment",
    postPlaceholder: "Write your post...",
    commentPlaceholder: "Write your comment...",
    submitComment: "Submit Comment",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    weeklyTitle: "Weekly Ranking",
    userTitle: "User Center",
    settingsTitle: "Settings",
  },
  zh: {
    lang:"🌐中",
    home: "首页",
    user: "用户中心",
    weekly: "每周排行",
    settings: "设置",
    login: "登录/注册",
    logout: "退出",
    comment: "评论",
    postPlaceholder: "写下你的帖子...",
    commentPlaceholder: "写下你的评论...",
    submitComment: "发表评论",
    delete: "删除",
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    weeklyTitle: "每周排行",
    userTitle: "个人中心",
    settingsTitle: "设置",
  }
};

// 示例数据：帖子列表
// const posts = [ ... ];
let posts = [];

// 用户中心数据
// const userProfile = { ... };
let userProfile = {
  username: '',
  bio: '',
  posts: []
};

// 每周排行数据
// const weeklyRanking = [ ... ];
let weeklyRanking = [];

// ========== 全局token管理 ========== //
function getToken() {
  return localStorage.getItem('token') || '';
}
function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
function parseToken(token) {
  try { return JSON.parse(atob(token)); } catch { return {}; }
}
function getCurrentUsername() {
  const token = getToken();
  return token ? (parseToken(token).username || '') : '';
}
function isLogin() {
  return !!getToken();
}
function logout() {
  setToken('');
  userInfo.style.display = 'none';
  loginRegisterBtn.style.display = '';
  goTo('home');
}
// ========== fetch封装 ========== //
async function apiFetch(url, options = {}) {
  const token = getToken();
  options.headers = options.headers || {};
  if (token) options.headers['Authorization'] = 'Bearer ' + token;
  let res;
  try {
    res = await fetch(url, options);
    if (res.status === 401) {
      logout();
      alert('登录已过期，请重新登录');
      throw new Error('未登录');
    }
    return res;
  } catch (e) {
    throw e;
  }
}
// ========== 数据拉取与刷新 ========== //
async function fetchPosts() {
  const res = await apiFetch('/api/posts');
  posts = await res.json();
}
async function fetchWeeklyRanking() {
  const res = await apiFetch('/api/weekly');
  weeklyRanking = await res.json();
}
async function fetchUserProfile() {
  if (!isLogin()) return;
  const res = await apiFetch('/api/user/profile?username=' + encodeURIComponent(getCurrentUsername()));
  if (res.ok) {
    const data = await res.json();
    userProfile.username = data.username;
    userProfile.bio = data.bio;
    userProfile.posts = data.posts || [];
  }
}
// ========== 首页渲染 ========== //
async function renderPosts(container) {
  container.innerHTML = '<div class="loading">加载中...</div>';
  await fetchPosts();
  container.innerHTML = '';
  const banner = document.createElement('div');
  banner.className = 'home-banner';
  banner.innerHTML = '<span>Who is the most stupid?</span>';
  container.appendChild(banner);
  posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.addEventListener('click', () => goToDetail(post.id));
    const userDiv = document.createElement('div');
    userDiv.className = 'username';
    userDiv.textContent = post.username;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = post.content;
    postDiv.appendChild(userDiv);
    postDiv.appendChild(contentDiv);
    container.appendChild(postDiv);
  });
}
// ========== 帖子详情弹窗 ========== //
async function goToDetail(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const modal = document.getElementById('modal');
  modal.innerHTML = '';
  modal.style.display = 'flex';
  const content = document.createElement('div');
  content.className = 'modal-content';
  content.style.maxWidth = '860px';
  content.style.minWidth = '600px';
  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  content.appendChild(closeBtn);
  // 帖子头部
  const header = document.createElement('div');
  header.className = 'modal-post-header';
  const avatar = document.createElement('div');
  avatar.className = 'modal-avatar';
  avatar.textContent = post.username ? post.username[0].toUpperCase() : '?';
  header.appendChild(avatar);
  const userInfo = document.createElement('div');
  const usernameSpan = document.createElement('span');
  usernameSpan.className = 'modal-username';
  usernameSpan.textContent = post.username;
  userInfo.appendChild(usernameSpan);
  const timeSpan = document.createElement('span');
  timeSpan.className = 'modal-time';
  timeSpan.textContent = post.created_at ? post.created_at.replace('T', ' ').slice(0, 16) : '';
  userInfo.appendChild(timeSpan);
  header.appendChild(userInfo);
  content.appendChild(header);
  // 帖子内容
  const postContentDiv = document.createElement('div');
  postContentDiv.className = 'modal-post-content';
  postContentDiv.textContent = post.content;
  content.appendChild(postContentDiv);
  // 图片展示
  if (post.image_url) {
    const imgWrap = document.createElement('div');
    imgWrap.style.margin = '12px 0 8px 0';
    imgWrap.style.display = 'flex';
    imgWrap.style.justifyContent = 'flex-start';
    const img = document.createElement('img');
    img.src = post.image_url;
    img.className = 'img-preview-thumb';
    img.style.maxWidth = '180px';
    img.style.maxHeight = '180px';
    img.style.cursor = 'zoom-in';
    img.onclick = () => {
      const imgZoomModal = document.getElementById('imgZoomModal');
      const zoomedImg = document.getElementById('zoomedImg');
      zoomedImg.src = post.image_url;
      imgZoomModal.style.display = 'flex';
    };
    imgWrap.appendChild(img);
    content.appendChild(imgWrap);
  }
  // 代码文件下载
  if (post.codefile_url) {
    const codeWrap = document.createElement('div');
    codeWrap.className = 'codefile-preview';
    const icon = document.createElement('span');
    icon.className = 'codefile-icon';
    icon.textContent = '💾';
    codeWrap.appendChild(icon);
    const nameSpan = document.createElement('span');
    nameSpan.textContent = post.codefile_url.split('/').pop();
    codeWrap.appendChild(nameSpan);
    const downloadBtn = document.createElement('a');
    downloadBtn.href = post.codefile_url;
    downloadBtn.download = nameSpan.textContent;
    downloadBtn.className = 'upload-btn';
    downloadBtn.style.padding = '4px 16px';
    downloadBtn.style.fontSize = '0.98em';
    downloadBtn.style.marginLeft = '8px';
    downloadBtn.textContent = '下载代码';
    codeWrap.appendChild(downloadBtn);
    content.appendChild(codeWrap);
  }
  // 点赞按钮
  const likeBtn = document.createElement('button');
  likeBtn.className = 'like-btn';
  likeBtn.innerHTML = `<span class="like-icon">👍</span>点赞 <span>(${post.likes_count || 0})</span>`;
  likeBtn.onclick = async () => {
    // const token = getToken();
    // if (!token) {
    //   alert('请先登录');
    //   return;
    // }
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      const data = await res.json();
      if (data.success) {
        likeBtn.innerHTML = `<span class="like-icon">👍</span>点赞 <span>(${data.likes_count})</span>`;
        await fetchPosts();
      } else {
        alert(data.message || '点赞失败');
      }
    } catch {
      alert('网络错误');
    }
  };
  content.appendChild(likeBtn);
  // 评论区
  const commentsSection = document.createElement('div');
  commentsSection.className = 'comments-section';
  const commentsTitle = document.createElement('div');
  commentsTitle.className = 'comments-title';
  commentsTitle.textContent = '评论';
  commentsSection.appendChild(commentsTitle);
  // 拉取评论（如有接口可扩展）
  // 评论列表（如需可扩展为接口获取）
  // 评论输入框
  const commentInput = document.createElement('textarea');
  commentInput.className = 'comment-input';
  commentInput.placeholder = '写下你的评论...';
  commentsSection.appendChild(commentInput);
  // 提交评论按钮
  const submitBtn = document.createElement('button');
  submitBtn.className = 'comment-submit-btn';
  submitBtn.textContent = '发表评论';
  submitBtn.onclick = async () => {
    const contentVal = commentInput.value.trim();
    if (!contentVal) return;
    // const token = getToken();
    // if (!token) {
    //   alert('请先登录');
    //   return;
    // }
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({ content: contentVal })
      });
      const data = await res.json();
      if (res.ok) {
        commentInput.classList.add('fly-up');
        setTimeout(async () => {
          commentInput.value = '';
          commentInput.classList.remove('fly-up');
          await goToDetail(post.id); // 刷新弹窗
        }, 700);
      } else {
        alert(data.message || '评论失败');
      }
    } catch {
      alert('网络错误');
    }
  };
  commentsSection.appendChild(submitBtn);
  content.appendChild(commentsSection);
  modal.appendChild(content);
  // 点击遮罩关闭弹窗
  modal.onclick = function(e) {
    if (e.target === modal) modal.style.display = 'none';
  };
}

// ========== 用户中心 ========== //
async function renderUserCenter(container) {
  container.innerHTML = '<div class="loading">加载中...</div>';
  await fetchUserProfile();
  container.innerHTML = '';
  // 个人信息区
  const title = document.createElement('h2');
  title.textContent = `${userProfile.username} 的个人中心`;
  container.appendChild(title);
  // 昵称和简介
  const profileBox = document.createElement('div');
  profileBox.style.marginBottom = '18px';
  // 昵称
  const nameLabel = document.createElement('span');
  nameLabel.textContent = '昵称：';
  profileBox.appendChild(nameLabel);
  const nameSpan = document.createElement('span');
  nameSpan.textContent = userProfile.username;
  nameSpan.style.fontWeight = 'bold';
  profileBox.appendChild(nameSpan);
  // 简介
  const bioLabel = document.createElement('span');
  bioLabel.textContent = '   简介：';
  bioLabel.style.marginLeft = '16px';
  profileBox.appendChild(bioLabel);
  const bioSpan = document.createElement('span');
  bioSpan.textContent = userProfile.bio;
  profileBox.appendChild(bioSpan);
  // 编辑按钮
  const editBtn = document.createElement('button');
  editBtn.textContent = '编辑';
  editBtn.style.marginLeft = '18px';
  editBtn.className = 'comment-submit-btn';
  profileBox.appendChild(editBtn);
  let editing = false;
  editBtn.onclick = () => {
    if (editing) return;
    editing = true;
    nameSpan.innerHTML = `<input type='text' value='${userProfile.username}' id='edit-username' style='width:90px;'>`;
    bioSpan.innerHTML = `<input type='text' value='${userProfile.bio}' id='edit-bio' style='width:220px;'>`;
    editBtn.style.display = 'none';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '保存';
    saveBtn.className = 'comment-submit-btn';
    saveBtn.style.marginLeft = '10px';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.className = 'comment-submit-btn';
    cancelBtn.style.marginLeft = '8px';
    profileBox.appendChild(saveBtn);
    profileBox.appendChild(cancelBtn);
    saveBtn.onclick = async () => {
      const newName = document.getElementById('edit-username').value.trim();
      const newBio = document.getElementById('edit-bio').value.trim();
      if (!newName) return;
      // const token = getToken();
      // if (!token) { alert('请先登录'); return; }
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ username: newName, bio: newBio })
        });
        if (res.ok) {
          userProfile.username = newName;
          userProfile.bio = newBio;
          nameSpan.textContent = newName;
          bioSpan.textContent = newBio;
          saveBtn.remove();
          cancelBtn.remove();
          editBtn.style.display = '';
          editing = false;
        } else {
          alert('保存失败');
        }
      } catch {
        alert('网络错误');
      }
    };
    cancelBtn.onclick = () => {
      nameSpan.textContent = userProfile.username;
      bioSpan.textContent = userProfile.bio;
      saveBtn.remove();
      cancelBtn.remove();
      editBtn.style.display = '';
      editing = false;
    };
  };
  container.appendChild(profileBox);
  // 发布新帖子区
  const newPostBox = document.createElement('div');
  newPostBox.style.marginBottom = '24px';
  const newPostBtn = document.createElement('button');
  newPostBtn.textContent = '发布新帖子';
  newPostBtn.className = 'comment-submit-btn';
  newPostBox.appendChild(newPostBtn);
  container.appendChild(newPostBox);
  let editorVisible = false;
  let editorDiv = null;
  newPostBtn.onclick = () => {
    if (editorVisible) return;
    editorVisible = true;
    editorDiv = document.createElement('div');
    editorDiv.style.marginTop = '10px';
    editorDiv.style.background = '#23242b';
    editorDiv.style.borderRadius = '8px';
    editorDiv.style.padding = '18px';
    editorDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    const uploadArea = document.createElement('div');
    uploadArea.className = 'upload-area';
    const textarea = document.createElement('textarea');
    textarea.className = 'comment-input';
    textarea.placeholder = '写下你的新帖子内容...';
    textarea.style.minHeight = '60px';
    uploadArea.appendChild(textarea);
    // 仅支持文本发帖，图片/代码文件可后续扩展
    editorDiv.appendChild(uploadArea);
    const postBtn = document.createElement('button');
    postBtn.textContent = '发布';
    postBtn.className = 'comment-submit-btn';
    postBtn.style.marginRight = '10px';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.className = 'comment-submit-btn';
    editorDiv.appendChild(postBtn);
    editorDiv.appendChild(cancelBtn);
    newPostBox.appendChild(editorDiv);
    postBtn.onclick = async () => {
      const content = textarea.value.trim();
      if (!content) return;
      // const token = getToken();
      // if (!token) { alert('请先登录'); return; }
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ content })
        });
        if (res.ok) {
          await fetchUserProfile();
          await fetchPosts();
          renderUserCenter(container);
        } else {
          alert('发帖失败');
        }
      } catch {
        alert('网络错误');
      }
    };
    cancelBtn.onclick = () => {
      editorDiv.remove();
      editorVisible = false;
    };
  };
  // 我的帖子
  const postsTitle = document.createElement('h3');
  postsTitle.textContent = `${userProfile.username} 的帖子`;
  container.appendChild(postsTitle);
  userProfile.posts.forEach((post, idx) => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    const contentArea = document.createElement('div');
    contentArea.className = 'post-content-area';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = post.content;
    contentArea.appendChild(contentDiv);
    postDiv.appendChild(contentArea);
    postDiv.style.cursor = 'pointer';
    postDiv.onclick = () => goToDetail(post.id);
    // 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.className = 'comment-submit-btn delete-btn';
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm('确定要删除这条帖子吗？')) return;
      // const token = getToken();
      // if (!token) { alert('请先登录'); return; }
      try {
        const res = await fetch(`/api/posts/${post.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (res.ok) {
          await fetchUserProfile();
          await fetchPosts();
          renderUserCenter(container);
        } else {
          alert('删除失败');
        }
      } catch {
        alert('网络错误');
      }
    };
    postDiv.appendChild(delBtn);
    container.appendChild(postDiv);
  });
}

// ========== 排行榜 ========== //
async function renderWeeklyRanking(container) {
  container.innerHTML = '<div class="loading">加载中...</div>';
  await fetchWeeklyRanking();
  container.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = '每周排行';
  container.appendChild(title);
  const list = document.createElement('ol');
  list.className = 'ranking-list';
  const topTen = weeklyRanking.slice(0, 10);
  for (let idx = 0; idx < 10; idx++) {
    const item = topTen[idx];
    const li = document.createElement('li');
    li.style.position = 'relative';
    if (item) {
      const rankSpan = document.createElement('span');
      rankSpan.className = 'rank';
      rankSpan.textContent = idx + 1;
      const userSpan = document.createElement('span');
      userSpan.className = 'username';
      userSpan.textContent = item.username;
      const countSpan = document.createElement('span');
      countSpan.className = 'count';
      countSpan.textContent = `${item.count} 帖子`;
      li.append(rankSpan, userSpan, countSpan);
    } else {
      li.style.opacity = '0.4';
      li.style.fontStyle = 'italic';
      li.style.color = '#888';
      li.innerHTML = `<span class="rank">${idx + 1}</span> <span class="username">（空）</span> <span class="count"></span>`;
    }
    list.appendChild(li);
  }
  container.appendChild(list);
}

// 管理后台页面
function renderAdminPanel(container) {
  const title = document.createElement('h2');
  title.textContent = '管理后台 - 帖子管理';
  container.appendChild(title);

  // 帖子列表
  posts.forEach((post, index) => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.style.position = 'relative';

    const userDiv = document.createElement('div');
    userDiv.className = 'username';
    userDiv.textContent = post.username;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = post.content;
    postDiv.appendChild(userDiv);
    postDiv.appendChild(contentDiv);

    // 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.className = 'comment-submit-btn delete-btn';
    delBtn.style.position = 'absolute';
    delBtn.style.top = '16px';
    delBtn.style.right = '16px';
    delBtn.style.background = 'linear-gradient(90deg, #e53935 60%, #ff7043 100%)';
    delBtn.style.fontWeight = 'bold';
    delBtn.onclick = async () => {
      if (!confirm('确定要删除这条帖子吗？')) return;
      // 预留后端接口
      /*
      await fetch(`/api/posts/${index}`, { method: 'DELETE' });
      */
      const delUser = post.username;
      posts.splice(index, 1);
      const rankUser = weeklyRanking.find(item => item.username === delUser);
      if (rankUser) {
        rankUser.count--;
        if (rankUser.count <= 0) {
          const idx = weeklyRanking.indexOf(rankUser);
          if (idx !== -1) weeklyRanking.splice(idx, 1);
        }
      }
      showAdminPanelModal();
    };
    postDiv.appendChild(delBtn);

    container.appendChild(postDiv);
  });
}

// 管理后台弹窗
function showAdminPanelModal() {
  // 创建弹窗遮罩
  let modal = document.getElementById('admin-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.65)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    document.body.appendChild(modal);
  }
  modal.innerHTML = '';
  modal.style.display = 'flex';

  // 弹窗内容
  const content = document.createElement('div');
  content.className = 'modal-content';
  content.style.minWidth = '420px';
  content.style.maxWidth = '600px';
  content.style.width = '90vw';
  content.style.maxHeight = '85vh';
  content.style.overflowY = 'auto';
  content.style.position = 'relative';

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  content.appendChild(closeBtn);

  // 标题
  const title = document.createElement('h2');
  title.textContent = '管理后台 - 帖子管理';
  content.appendChild(title);

  // 帖子列表
  posts.forEach((post, index) => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.style.position = 'relative';

    const userDiv = document.createElement('div');
    userDiv.className = 'username';
    userDiv.textContent = post.username;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = post.content;
    postDiv.appendChild(userDiv);
    postDiv.appendChild(contentDiv);

    // 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.className = 'comment-submit-btn delete-btn';
    delBtn.style.position = 'absolute';
    delBtn.style.top = '16px';
    delBtn.style.right = '16px';
    delBtn.style.background = 'linear-gradient(90deg, #e53935 60%, #ff7043 100%)';
    delBtn.style.fontWeight = 'bold';
    delBtn.onclick = async () => {
      if (!confirm('确定要删除这条帖子吗？')) return;
      // 预留后端接口
      /*
      await fetch(`/api/posts/${index}`, { method: 'DELETE' });
      */
      // 1. 先找到被删帖子的用户名
      const delUser = post.username;
      // 2. 从posts数组移除
      posts.splice(index, 1);
      // 3. 同步更新排行榜数据
      const rankUser = weeklyRanking.find(item => item.username === delUser);
      if (rankUser) {
        rankUser.count--;
        if (rankUser.count <= 0) {
          // 帖子数为0则移除该用户
          const idx = weeklyRanking.indexOf(rankUser);
          if (idx !== -1) weeklyRanking.splice(idx, 1);
        }
      }
      // 4. 重新渲染弹窗内容
      showAdminPanelModal();
    };
    postDiv.appendChild(delBtn);

    content.appendChild(postDiv);
  });

  modal.appendChild(content);
  // 点击遮罩关闭弹窗
  modal.onclick = function(e) {
    if (e.target === modal) modal.style.display = 'none';
  };
}

// 用户帖子详情弹窗
function showUserPostDetailModal(idx) {
  const post = userProfile.posts[idx];
  let modal = document.getElementById('modal');
  modal.innerHTML = '';
  modal.style.display = 'flex';
  const content = document.createElement('div');
  content.className = 'modal-content';
  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  content.appendChild(closeBtn);
  // 标题
  const title = document.createElement('h2');
  title.textContent = '我的帖子详情';
  content.appendChild(title);
  // 内容
  const postContent = document.createElement('div');
  postContent.className = 'modal-post-content';
  postContent.textContent = post.content;
  content.appendChild(postContent);
  // 操作按钮区
  const actions = document.createElement('div');
  actions.className = 'post-actions';
  // 删除按钮（叉icon+Delete文字）
  const delBtn = document.createElement('button');
  delBtn.innerHTML = '✖️ Delete';
  delBtn.className = 'comment-submit-btn delete-btn icon-btn';
  delBtn.setAttribute('aria-label', '删除');
  delBtn.onclick = async () => {
    if (!confirm('确定要删除这条帖子吗？')) return;
    // 预留后端接口
    /*
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    */
    userProfile.posts.splice(idx, 1);
    const globalIdx = posts.findIndex(p => p.username === userProfile.username && p.content === post.content);
    if (globalIdx !== -1) {
      posts.splice(globalIdx, 1);
      const rankUser = weeklyRanking.find(item => item.username === userProfile.username);
      if (rankUser) {
        rankUser.count--;
        if (rankUser.count <= 0) {
          const idx = weeklyRanking.indexOf(rankUser);
          if (idx !== -1) weeklyRanking.splice(idx, 1);
        }
      }
    }
    modal.style.display = 'none';
    renderUserCenter(document.getElementById('posts-container'));
  };
  actions.appendChild(delBtn);
  content.appendChild(actions);
  modal.appendChild(content);
  // 点击遮罩关闭弹窗
  modal.onclick = function(e) {
    if (e.target === modal) modal.style.display = 'none';
  };
}

// 渲染设置页
function renderSettings(container) {
  container.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = '设置';
  container.appendChild(title);

  // 主题切换
  const themeBox = document.createElement('div');
  themeBox.style.margin = '18px 0';
  const themeLabel = document.createElement('span');
  themeLabel.textContent = '主题：';
  themeLabel.style.marginRight = '12px';
  themeBox.appendChild(themeLabel);
  const themeSelect = document.createElement('select');
  themeSelect.innerHTML = '<option value="dark">暗色</option><option value="light">亮色</option>';
  themeSelect.value = localStorage.getItem('theme') || 'dark';
  themeSelect.onchange = function() {
    setTheme(themeSelect.value);
    localStorage.setItem('theme', themeSelect.value);
  };
  themeBox.appendChild(themeSelect);
  container.appendChild(themeBox);

  // 语言切换
  const langBox = document.createElement('div');
  langBox.style.margin = '18px 0';
  const langLabel = document.createElement('span');
  langLabel.textContent = '语言/Language:';
  langLabel.style.marginRight = '12px';
  langBox.appendChild(langLabel);
  const langSelect = document.createElement('select');
  langSelect.innerHTML = '<option value="zh">中文</option><option value="en">English</option>';
  langSelect.value = localStorage.getItem('lang') || 'zh';
  langSelect.onchange = function() {
    setLang(langSelect.value);
    localStorage.setItem('lang', langSelect.value);
    renderSettings(container); // 立即刷新设置页语言
  };
  langBox.appendChild(langSelect);
  container.appendChild(langBox);

  // 预留更多设置项
  const moreBox = document.createElement('div');
  moreBox.style.margin = '18px 0';
  moreBox.innerHTML = '<span style="color:#aaa;">更多设置功能，敬请期待...</span>';
  container.appendChild(moreBox);
}

// 主题切换实现
function setTheme(theme) {
  if (theme === 'light') {
    document.body.style.background = '#f5f5f5';
    document.body.style.color = '#222';
  } else {
    document.body.style.background = '#121212';
    document.body.style.color = '#e0e0e0';
  }
}
// 页面加载时自动应用主题
setTheme(localStorage.getItem('theme') || 'dark');

// 语言切换实现（简单示例，实际可扩展为多语言字典）
function setLang(lang) {
  window._lang = lang;
  const t = langDict[lang];

  // 侧边框按钮 UI
  document.querySelector('.nav-button[data-section="home"]').textContent = t.home;
  document.querySelector('.nav-button[data-section="user"]').textContent = t.user;
  document.querySelector('.nav-button[data-section="weekly"]').textContent = t.weekly;
  document.querySelector('.nav-button[data-section="settings"]').textContent = t.settings;
  

  // 登录登出按钮 UI
  const loginBtn = document.getElementById('loginRegisterBtn');
  if (loginBtn) loginBtn.textContent = t.login;
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.textContent = t.logout;

  const globeBtn = document.getElementById('langToggleBtn');
  if (globeBtn) globeBtn.textContent = t.lang;

}
setLang(localStorage.getItem('lang') || 'zh');

// 根据lang动态切换页面文本
document.querySelectorAll('.languageSelection a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const lang = link.getAttribute('language') === 'English' ? 'en' : 'zh';
    localStorage.setItem('lang', lang);
    setLang(lang);
  });
});

// 语言切换应用
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('lang') || 'zh';
  setLang(savedLang);
});
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('langToggleBtn');
  if (btn) btn.addEventListener('click', toggleLanguage);
});
// ========== 登录/注册相关 ==========
const loginRegisterBtn = document.getElementById('loginRegisterBtn');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userNickname = document.getElementById('userNickname');
const logoutBtn = document.getElementById('logoutBtn');

function showAuthModal() {
  authModal.style.display = 'flex';
  authError.textContent = '';
}
function hideAuthModal() {
  authModal.style.display = 'none';
  loginForm.reset();
  registerForm.reset();
  authError.textContent = '';
}
loginRegisterBtn.onclick = showAuthModal;
closeAuthModal.onclick = hideAuthModal;
authModal.onclick = e => { if (e.target === authModal) hideAuthModal(); };

// 切换登录/注册
loginTab.onclick = () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.style.display = '';
  registerForm.style.display = 'none';
  authError.textContent = '';
};
registerTab.onclick = () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  loginForm.style.display = 'none';
  registerForm.style.display = '';
  authError.textContent = '';
};

// 登录表单提交
loginForm.onsubmit = async e => {
  e.preventDefault();
  const username = loginForm.loginUsername.value.trim();
  const password = loginForm.loginPassword.value;
  if (!username || !password) {
    authError.textContent = '请输入用户名和密码';
    return;
  }
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setToken(data.token);
      setUserInfo(data.user);
      hideAuthModal();
      await fetchUserProfile();
      await fetchPosts();
      await fetchWeeklyRanking();
      goTo('home');
    } else {
      authError.textContent = data.message || '登录失败';
    }
  } catch (err) {
    authError.textContent = '网络错误，请稍后再试';
  }
};

// ========== 注册邮箱验证码相关 ==========
const registerEmail = document.getElementById('registerEmail');
const registerCode = document.getElementById('registerCode');
const sendCodeBtn = document.getElementById('sendCodeBtn');
let codeTimer = null, codeTime = 0;

function validateEmail(email) {
  return /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email);
}

sendCodeBtn.onclick = async () => {
  const email = registerEmail.value.trim();
  if (!validateEmail(email)) {
    authError.textContent = '请输入有效的邮箱地址';
    return;
  }
  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = '发送中...';
  authError.textContent = '';
  try {
    const res = await fetch('/api/send_email_code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      startCodeTimer();
      authError.textContent = '验证码已发送，请查收邮箱';
      if (data.code) {
        // 模拟发送时弹窗显示验证码
        alert('【测试专用】验证码：' + data.code);
      }
    } else {
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = '获取验证码';
      authError.textContent = data.message || '发送失败';
    }
  } catch {
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = '获取验证码';
    authError.textContent = '网络错误，请稍后再试';
  }
};

function startCodeTimer() {
  codeTime = 60;
  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = codeTime + 's后重试';
  codeTimer = setInterval(() => {
    codeTime--;
    if (codeTime > 0) {
      sendCodeBtn.textContent = codeTime + 's后重试';
    } else {
      clearInterval(codeTimer);
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = '获取验证码';
    }
  }, 1000);
}

// 修改注册表单提交逻辑，增加邮箱和验证码
registerForm.onsubmit = async e => {
  e.preventDefault();
  const username = registerForm.registerUsername.value.trim();
  const email = registerForm.registerEmail.value.trim();
  const code = registerForm.registerCode.value.trim();
  const password = registerForm.registerPassword.value;
  const confirm = registerForm.registerConfirm.value;
  if (!username || !email || !code || !password || !confirm) {
    authError.textContent = '请填写所有字段';
    return;
  }
  if (!validateEmail(email)) {
    authError.textContent = '请输入有效的邮箱地址';
    return;
  }
  if (password !== confirm) {
    authError.textContent = '两次密码不一致';
    return;
  }
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, code, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      authError.textContent = '注册成功，请登录';
      setTimeout(() => {
        loginTab.click();
        authError.textContent = '';
      }, 1000);
    } else {
      authError.textContent = data.message || '注册失败';
    }
  } catch (err) {
    authError.textContent = '网络错误，请稍后再试';
  }
};

// 设置用户信息
function setUserInfo(user) {
  if (!user) return;
  loginRegisterBtn.style.display = 'none';
  userInfo.style.display = 'flex';
  userAvatar.src = user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(user.username);
  userNickname.textContent = user.nickname || user.username;
}
// 退出登录
logoutBtn.onclick = () => {
  logout();
};

// 页面加载时自动获取用户信息
async function fetchUserInfo() {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch('/api/user', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const data = await res.json();
      setUserInfo(data.user);
    } else {
      logout();
    }
  } catch {}
}
fetchUserInfo();

// 页面加载完成后默认跳转到首页
document.addEventListener('DOMContentLoaded', () => {
  goTo('home');
});

// 清除导航高亮
function clearActiveNav() {
  document.querySelectorAll('.nav-button').forEach(btn => {
    btn.classList.remove('active');
  });
}
// 路由函数：根据 section 渲染不同视图
function goTo(section) {
  clearActiveNav();
  const btn = document.querySelector(`.nav-button[data-section="${section}"]`);
  if (btn) btn.classList.add('active');
  const container = document.getElementById('posts-container');
  container.innerHTML = '';
  switch (section) {
    case 'user':
      renderUserCenter(container);
      break;
    case 'weekly':
      renderWeeklyRanking(container);
      break;
    case 'settings':
      renderSettings(container);
      break;
    case 'admin':
      renderAdminPanel(container);
      break;
    default:
      renderPosts(container);
  }
}
