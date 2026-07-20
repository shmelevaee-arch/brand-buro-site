// Отправка формы заявки в Telegram через Bot API.
//
// TODO: впишите сюда свои значения (см. инструкцию, которую прислал ассистент):
// 1. BOT_TOKEN — токен, который выдаёт @BotFather после /newbot
// 2. CHAT_ID   — id чата/аккаунта, куда должны приходить заявки
// Пока поля пустые, форма работает как заглушка (ничего никуда не шлёт).
const BOT_TOKEN = '7855849908:AAE3WxuxQojtC0U9WkCrMfwlWikoKVZ_kyw';
const CHAT_ID = '518638966';

const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const contact = (data.get('contact') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim() || '—';

    if (!BOT_TOKEN || !CHAT_ID) {
      console.log('Заявка (BOT_TOKEN/CHAT_ID не заданы, никуда не отправлена):', Object.fromEntries(data));
      note.textContent = 'Спасибо! Заявка отправлена — свяжемся с вами в ближайшее время.';
      form.reset();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    note.textContent = 'Отправляем...';

    const text =
      'Новая заявка с сайта Бренд Бюро\n\n' +
      'Имя: ' + name + '\n' +
      'Контакт: ' + contact + '\n' +
      'Задача: ' + message;

    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text }),
      });

      if (!res.ok) throw new Error('Telegram API error');

      note.textContent = 'Спасибо! Заявка отправлена — свяжемся с вами в ближайшее время.';
      form.reset();
    } catch (err) {
      console.error('Не удалось отправить заявку в Telegram:', err);
      note.textContent = 'Не получилось отправить форму. Напишите нам в Telegram напрямую.';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ===== Motion: появление блоков при скролле =====
const revealEls = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Страховка: если по какой-то причине IntersectionObserver не сработал
  // (нетипичное окружение, вкладка в фоне и т.п.), контент не должен
  // навсегда оставаться невидимым.
  window.addEventListener('load', () => {
    setTimeout(() => {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }, 1500);
  });
}

// ===== Motion: магнитные кнопки =====
if (!prefersReducedMotion) {
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transition = 'transform 0s';
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 0.84, 0.44, 1)';
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

// ===== Карусель кейсов =====
const casesViewport = document.getElementById('casesViewport');

if (casesViewport) {
  const arrows = document.querySelectorAll('.cases__arrow');
  const card = casesViewport.querySelector('.case-card');
  const step = () => (card ? card.getBoundingClientRect().width : casesViewport.clientWidth);

  const updateArrows = () => {
    const maxScroll = casesViewport.scrollWidth - casesViewport.clientWidth - 1;
    arrows.forEach((btn) => {
      const dir = Number(btn.dataset.dir);
      if (dir < 0) btn.disabled = casesViewport.scrollLeft <= 0;
      if (dir > 0) btn.disabled = casesViewport.scrollLeft >= maxScroll;
    });
  };

  arrows.forEach((btn) => {
    btn.addEventListener('click', () => {
      casesViewport.scrollBy({ left: Number(btn.dataset.dir) * step(), behavior: 'smooth' });
    });
  });

  casesViewport.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}
