const form = document.querySelector('#search-form');
const usernameInput = document.querySelector('#username');
const statusBox = document.querySelector('#status');
const profileBox = document.querySelector('#profile');
const reposBox = document.querySelector('#repos');

const API_BASE = 'https://api.github.com/users';

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  if (!username) {
    showStatus('Please enter a GitHub username.', 'error');
    usernameInput.focus();
    return;
  }
  fetchGitHubData(username);
});

async function fetchGitHubData(username) {
  showStatus('Loading GitHub data...');
  profileBox.innerHTML = '';
  reposBox.innerHTML = '';

  try {
    const [profileResponse, reposResponse] = await Promise.all([
      fetch(`${API_BASE}/${encodeURIComponent(username)}`),
      fetch(`${API_BASE}/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`)
    ]);

    if (!profileResponse.ok) {
      if (profileResponse.status === 404) throw new Error('GitHub user not found. Please try another username.');
      if (profileResponse.status === 403) throw new Error('GitHub rate limit reached. Please wait and try again later.');
      throw new Error('Could not load the GitHub profile.');
    }
    if (!reposResponse.ok) throw new Error('Profile loaded, but repositories could not be fetched.');

    const profile = await profileResponse.json();
    const repos = await reposResponse.json();

    hideStatus();
    renderProfile(profile);
    renderRepos(repos);
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

function showStatus(message, type = 'normal') {
  statusBox.textContent = message;
  statusBox.className = `status visible${type === 'error' ? ' error' : ''}`;
}

function hideStatus() {
  statusBox.textContent = '';
  statusBox.className = 'status';
}

function renderProfile(profile) {
  profileBox.innerHTML = `
    <article class="profile-card">
      <img src="${profile.avatar_url}" alt="${escapeHtml(profile.login)} GitHub avatar" />
      <div>
        <h2>${escapeHtml(profile.name || profile.login)}</h2>
        <p>${escapeHtml(profile.bio || 'No bio added to this GitHub profile.')}</p>
        <div class="meta">
          <span>@${escapeHtml(profile.login)}</span>
          <span>${profile.public_repos} repositories</span>
          <span>${profile.followers} followers</span>
          <span>${profile.following} following</span>
        </div>
        <p class="meta"><a href="${profile.html_url}" target="_blank" rel="noopener">Open GitHub Profile</a></p>
      </div>
    </article>
  `;
}

function renderRepos(repos) {
  if (!repos.length) {
    reposBox.innerHTML = '<section class="status visible">No public repositories found.</section>';
    return;
  }

  const cards = repos.map((repo) => `
    <article class="repo-card">
      <h3>${escapeHtml(repo.name)}</h3>
      <p>${escapeHtml(repo.description || 'No description provided.')}</p>
      <a href="${repo.html_url}" target="_blank" rel="noopener">View Repository</a>
      <div class="repo-stats">
        <span>★ ${repo.stargazers_count}</span>
        <span>⑂ ${repo.forks_count}</span>
        <span>${escapeHtml(repo.language || 'Code')}</span>
      </div>
    </article>
  `).join('');

  reposBox.innerHTML = `
    <div class="repos-header">
      <div><p class="tag">Latest repositories</p><h2>Public GitHub repositories</h2></div>
      <p>Showing up to 6 recently updated repositories.</p>
    </div>
    <div class="repo-grid">${cards}</div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));
}

fetchGitHubData('vugar1995');
