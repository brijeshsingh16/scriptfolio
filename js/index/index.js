/**
 * ScriptFolio — Single-shell controller
 * One navbar. Two views:
 *   #practice -> sidebar (left) + iframe page (right)
 *   anything else (#top, #features, ...) -> landing page sections
 */

const TOPICS_CONFIG = [
  {
    id: 'python',
    title: 'Python',
    icon: 'fa-brands fa-python',
    subtopics: [
      { name: 'Operators', file: 'topics/python/operator.html' },
      { name: 'ASCII', file: 'topics/python/ascii.html' },
      { name: 'Strings', file: 'topics/python/string.html' },
      { name: 'If Statement', file: 'topics/python/if.html' },
      { name: 'If-Else', file: 'topics/python/if-else.html' },
      { name: 'If-Elif-Else', file: 'topics/python/if-elif-else.html' },
      { name: 'Nested If-Else', file: 'topics/python/nested-if-else.html' },
      { name: 'For Loop', file: 'topics/python/for-loop.html' },
      { name: 'While Loop', file: 'topics/python/while-loop.html' },
      { name: 'Nested For Loop', file: 'topics/python/nested-for-loop.html' },
      { name: 'Continue Statement', file: 'topics/python/continue-statement.html' },
      { name: 'Pass Statement', file: 'topics/python/pass-statement.html' },
      { name: 'Lists', file: 'topics/python/list.html' },
      { name: 'Tuples', file: 'topics/python/tuple.html' },
      { name: 'Sets', file: 'topics/python/set.html' },
      { name: 'Dictionaries', file: 'topics/python/dictionary.html' },
      { name: 'Functions', file: 'topics/python/function.html' }
    ]
  }
];

const NOTES_URL = 'https://notes-computer.vercel.app/';

let workspaceReady = false;   // iframe is loaded lazily the first time Practice opens

/* ------------------------------------------------------------------ */
/* Startup                                                             */
/* ------------------------------------------------------------------ */
window.addEventListener('DOMContentLoaded', () => {
  measureNavbar();

  // Dynamic counts
  const totalBadge = document.getElementById('totalLanguagesBadge');
  if (totalBadge) totalBadge.innerText = `${TOPICS_CONFIG.length} ${TOPICS_CONFIG.length === 1 ? 'Language' : 'Languages'}`;

  const statTopics = document.getElementById('statTopics');
  if (statTopics) {
    statTopics.innerText = TOPICS_CONFIG.reduce((sum, t) => sum + t.subtopics.length, 0);
  }

  renderSidebar();

  // Old deep links (?page=..., ?topic=...&subtopic=..., ?portal=notes) still work
  // and open the Practice view automatically.
  const p = new URLSearchParams(window.location.search);
  const hasDeepLink = p.get('page') || p.get('file') || (p.get('topic') && p.get('subtopic')) || p.get('portal');
  if (hasDeepLink && !location.hash) {
    history.replaceState(null, '', location.pathname + location.search + '#practice');
  }

  route();
});

window.addEventListener('hashchange', route);
window.addEventListener('resize', measureNavbar);

/** Keeps --nav-h equal to the real navbar height so the workspace fills the rest. */
function measureNavbar() {
  const nav = document.querySelector('.landing-nav');
  if (nav) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
}

/* ------------------------------------------------------------------ */
/* View routing                                                        */
/* ------------------------------------------------------------------ */
function route() {
  const hash = location.hash || '#top';

  if (hash === '#practice') {
    showView('practice');
    return;
  }

  showView('home');
  const id = hash.slice(1);
  requestAnimationFrame(() => {
    if (id === 'top') {
      window.scrollTo({ top: 0 });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
    }
  });
}

function showView(name) {
  const isPractice = name === 'practice';

  document.getElementById('homeView').classList.toggle('active', !isPractice);
  document.getElementById('practiceView').classList.toggle('active', isPractice);
  document.body.classList.toggle('practice-mode', isPractice);

  // Highlight "Practice" (or "Home") in the shared navbar
  document.querySelectorAll('.nav-link[data-nav]').forEach(link => {
    const active = link.dataset.nav === 'practice'
      ? isPractice
      : (!isPractice && (location.hash || '#top') === '#top');
    link.classList.toggle('active', active);
  });

  if (isPractice) {
    measureNavbar();
    if (!workspaceReady) {
      workspaceReady = true;
      openInitialPage();
    }
  } else {
    toggleSidebar(false);
  }
}

/** Decides which page to show first inside the iframe (supports deep links). */
function openInitialPage() {
  const p = new URLSearchParams(window.location.search);
  const paramPage = p.get('page') || p.get('file');
  const paramTopic = p.get('topic');
  const paramSub = p.get('subtopic');

  if (p.get('portal') === 'notes') {
    loadExternalPortal('Computer Notes', 'notes-computer.vercel.app', NOTES_URL);
    return;
  }

  let t = TOPICS_CONFIG[0].title;
  let s = TOPICS_CONFIG[0].subtopics[0].name;
  let f = TOPICS_CONFIG[0].subtopics[0].file;

  if (paramPage) {
    for (const topic of TOPICS_CONFIG) {
      const m = topic.subtopics.find(x => x.file.toLowerCase() === paramPage.toLowerCase());
      if (m) { t = topic.title; s = m.name; f = m.file; break; }
    }
  } else if (paramTopic && paramSub) {
    const ft = TOPICS_CONFIG.find(x => x.title.toLowerCase() === paramTopic.toLowerCase());
    const fs = ft && ft.subtopics.find(x => x.name.toLowerCase() === paramSub.toLowerCase());
    if (ft && fs) { t = ft.title; s = fs.name; f = fs.file; }
  }

  loadPage(t, s, f);
}

/* ------------------------------------------------------------------ */
/* Practice sidebar                                                    */
/* ------------------------------------------------------------------ */
function renderSidebar() {
  const container = document.getElementById('practiceContainer');
  if (!container) return;
  container.innerHTML = '';

  TOPICS_CONFIG.forEach((topic) => {
    const group = document.createElement('div');
    group.className = 'topic-group';

    const header = document.createElement('div');
    header.className = 'topic-title';
    header.setAttribute('title', 'Click to collapse/expand');
    header.innerHTML = `
      <div class="topic-title-left">
        <i class="${topic.icon} topic-icon"></i>
        <span>${escapeHtml(topic.title)}</span>
      </div>
      <div class="topic-title-right">
        <span class="subtopic-count-tag">${topic.subtopics.length}</span>
        <i class="fa-solid fa-chevron-down topic-toggle-icon"></i>
      </div>
    `;
    header.onclick = () => group.classList.toggle('collapsed');
    group.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'subtopic-nav';

    topic.subtopics.forEach((sub) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = sub.file;
      link.className = 'subtopic-link';
      link.dataset.file = sub.file;
      link.innerHTML = `<span><i class="fa-solid fa-angle-right" style="margin-right: 6px; font-size: 10px;"></i>${escapeHtml(sub.name)}</span>`;

      link.onclick = (e) => {
        e.preventDefault();
        loadPage(topic.title, sub.name, sub.file);
        toggleSidebar(false);
      };

      li.appendChild(link);
      list.appendChild(li);
    });

    group.appendChild(list);
    container.appendChild(group);
  });
}

/** Loads a local topic page into the right-side iframe. */
function loadPage(topicName, subtopicName, fileName) {
  const pinned = document.getElementById('pinnedPortalCard');
  if (pinned) pinned.classList.remove('active');

  setText('activeLanguageText', topicName);
  setText('activeSubtopicText', subtopicName);
  setText('mobileCurrentText', `${topicName} › ${subtopicName}`);

  const openAnchor = document.getElementById('openExternalAnchor');
  if (openAnchor) openAnchor.href = fileName;

  document.querySelectorAll('#practiceView .subtopic-link').forEach(link => {
    if (link.dataset.file === fileName) {
      link.classList.add('active');
      const group = link.closest('.topic-group');
      if (group) group.classList.remove('collapsed');
    } else {
      link.classList.remove('active');
    }
  });

  const frame = document.getElementById('externalPageFrame');
  if (frame) frame.src = fileName;
}

/** Loads the Computer Notes site inside the iframe. */
function loadExternalPortal(title, displayHost, url) {
  const pinned = document.getElementById('pinnedPortalCard');
  if (pinned) pinned.classList.add('active');
  document.querySelectorAll('#practiceView .subtopic-link').forEach(l => l.classList.remove('active'));

  setText('activeLanguageText', 'External Resource');
  setText('activeSubtopicText', title);
  setText('mobileCurrentText', title);

  const openAnchor = document.getElementById('openExternalAnchor');
  if (openAnchor) openAnchor.href = url;

  const frame = document.getElementById('externalPageFrame');
  if (frame) frame.src = url;

  toggleSidebar(false);
}

/** Practice drawer on mobile. */
function toggleSidebar(open) {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle('open', !!open);
  overlay.classList.toggle('active', !!open);
}

/* ------------------------------------------------------------------ */
/* Navbar mobile drawer (from landing-page.js)                         */
/* ------------------------------------------------------------------ */
function toggleMobileMenu() {
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileNavOverlay');
  if (!drawer || !overlay) return;

  if (drawer.classList.contains('open')) {
    closeMobileMenu();
  } else {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileNavOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    toggleSidebar(false);
  }
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
