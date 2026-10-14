/**
 * Pages Helper Controller
 * Automatically counts questions, manages clipboard copy, and handles lightboxes.
 */

// 1. Auto-count questions on page load
window.addEventListener('DOMContentLoaded', () => {
  updateTotalQuestionsCount();
});

/**
 * Counts all `.qa-card` elements on the page and updates #totalQuestionsCount
 */
function updateTotalQuestionsCount() {
  const cards = document.querySelectorAll('.qa-card');
  const countBadge = document.getElementById('totalQuestionsCount');
  
  if (countBadge) {
    const total = cards.length;
    countBadge.innerText = `${total} ${total === 1 ? 'Question' : 'Questions'}`;
  }
}

/**
 * Copy Question Text to Clipboard with fallback for iFrames
 */
function copyQuestion(elementId, btnElement) {
  const textEl = document.getElementById(elementId);
  if (!textEl) return;
  const textToCopy = textEl.innerText;

  // Try modern clipboard API, fallback to execCommand
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      triggerCopySuccess(btnElement);
    }).catch(() => {
      fallbackCopyText(textToCopy, btnElement);
    });
  } else {
    fallbackCopyText(textToCopy, btnElement);
  }
}

function fallbackCopyText(text, btnElement) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    triggerCopySuccess(btnElement);
  } catch (err) {
    console.error('Could not copy text: ', err);
  }
  document.body.removeChild(textarea);
}

function triggerCopySuccess(btnElement) {
  const originalHTML = btnElement.innerHTML;
  btnElement.classList.add('copied');
  btnElement.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';

  const toast = document.getElementById('toastNotice');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  setTimeout(() => {
    btnElement.classList.remove('copied');
    btnElement.innerHTML = originalHTML;
  }, 2000);
}

/**
 * Lightbox Modal functions
 */
function openLightbox(containerElement) {
  const img = containerElement.querySelector('img');
  if (!img) return;
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  if (modal && modalImg) {
    modalImg.src = img.src;
    modal.classList.add('active');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});