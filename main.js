// 기능마다 따로 초기화한다. 하나가 실패해도 나머지와 본문은 그대로 동작한다.
(function () {
  var root = document.documentElement;

  function safe(fn) {
    try { fn(); } catch (err) { if (window.console) console.error(err); }
  }

  // ── 인트로: 종료 이벤트가 없어도 정해진 시간 뒤 제거 ──
  safe(function () {
    var intro = document.querySelector('.intro');
    if (!intro) return;
    var done = function () { intro.classList.add('is-done'); root.classList.remove('intro-on'); };
    if (!root.classList.contains('intro-on')) { done(); return; }
    intro.addEventListener('animationend', function (e) {
      if (e.animationName === 'intro-out') done();
    });
    setTimeout(done, 1300);
  });

  // ── 언어 전환 ──
  safe(function () {
    var buttons = document.querySelectorAll('[data-set-lang]');
    var labelled = document.querySelectorAll('[data-label-en]');
    var images = document.querySelectorAll('img[data-alt-en]');

    labelled.forEach(function (el) { el.dataset.labelKo = el.getAttribute('aria-label'); });
    images.forEach(function (img) { img.dataset.altKo = img.getAttribute('alt'); });

    var titles = { ko: document.title, en: root.dataset.titleEn || 'Lee Byeongchan — Communicator, Frontend' };

    function setLang(lang, save) {
      root.dataset.lang = lang;
      root.lang = lang;
      document.title = titles[lang];
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)); });
      labelled.forEach(function (el) {
        el.setAttribute('aria-label', lang === 'en' ? el.dataset.labelEn : el.dataset.labelKo);
      });
      images.forEach(function (img) {
        img.setAttribute('alt', lang === 'en' ? img.dataset.altEn : img.dataset.altKo);
      });
      if (save) { try { localStorage.setItem('lang', lang); } catch (_) {} }
    }

    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (_) {}
    if (saved === 'en') setLang('en', false);

    buttons.forEach(function (b) {
      // 클릭한 버튼은 화면에 남아 있으므로 포커스가 유지된다
      b.addEventListener('click', function () { setLang(b.dataset.setLang, true); });
    });
  });

  // ── 모바일 메뉴 ──
  safe(function () {
    var bar = document.getElementById('top-bar');
    var btn = bar && bar.querySelector('.top__menu');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      bar.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
    // 데스크톱 폭으로 넓어지면 열림 상태 정리
    window.matchMedia('(min-width: 761px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
  });

  // ── 헤더 테마: HERO 위에서는 밝게, 본문에서는 어둡게 ──
  safe(function () {
    var bar = document.getElementById('top-bar');
    var hero = document.querySelector('.hero');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-dark', !entries[0].isIntersecting);
    }, { rootMargin: '-' + bar.offsetHeight + 'px 0px 0px 0px' });
    io.observe(hero);
  });

  // ── 스크롤 등장: 관찰자 준비에 성공한 경우에만 숨김을 건다 ──
  safe(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    var items = document.querySelectorAll('.reveal');
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) {
      // 이미 화면 안에 있는 요소는 바로 보이게
      if (el.getBoundingClientRect().top < vh) el.classList.add('is-in');
      else io.observe(el);
    });
    root.classList.add('reveal-ready');
  });
})();
