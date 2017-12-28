(() => {
  const s1 = (sel, context) => s(sel, context)[0];
  const s = (sel, context) => Array.from((document || context).querySelectorAll(sel));
  const c = (t, context) => (document || context).createElement(t);
  const on = (els, type, cb = () => {}) => {
    if (Array.isArray(els)) {
      els.forEach(el => {
        el.addEventListener(type, cb);
      });
    }
    else {
      els.addEventListener(type, cb);
    }
  };
  const genId = () => Math.random().toString(36).substring(2).toUpperCase();

  const download = e => {
    const getData = $el => {
      let data, type;
      if ($el.classList.contains('md')) {
        data = m.textarea.value;
        type = 'md';
      }
      else if ($el.classList.contains('html')) {
        data = m.preview.innerHTML;
        type = 'html';
      }
      return [data, type];
    };
    const [data, type] = getData(e.target);
    if (!data) {
      return;
    }
    new Downloader(data, `markdown.${type}`);
  };

  const initBackend = () => {
    const APP_ID = '72ED2FC4-E95E-68A3-FFBF-62A5B3EA0B00';
    const API_KEY = '09869274-3CCD-D731-FFAA-2CAAEF5C3C00';
    Backendless.serverURL = 'https://api.backendless.com';
    Backendless.initApp(APP_ID, API_KEY);
  };

  const saveNote = (hash) => {
    const value = m.value;
    const note = {
      hash,
      value
    };
    Backendless.Data.of('notes').save(note)
    .then(onSavedNote)
    .catch(err => onSavedNote(null));
  };

  const getLinkSelected = () => {
    const range = document.createRange();
    const $el = s1('#savedNoteLink');
    if (!$el) {
      return;
    }
    range.setStartBefore($el);
    range.setEndAfter($el);
    window.getSelection().addRange(range);
  };

  const removeSelection = () => window.getSelection().removeAllRanges();

  const setUrl = hash => window.history.pushState('main', 'Markdown', `?note=${hash}`);

  const onSavedNote = note => {
    const link = `${location.href}?note=${note && note.hash}`;
    const modalContent = note ? `<h1 id="savedNoteLink">${link}</h1>` : '<h1>There was a problem while saving your note.</h1>';
    const footerText = note ? 'Copy to clipboard' : 'Ok';
    const modal = new tingle.modal({
      footer: true,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: 'Close',
      onOpen: getLinkSelected,
      onClose: removeSelection
    });
    modal.setContent(modalContent);
    modal.addFooterBtn(footerText, 'tingle-btn tingle-btn--primary', () => {
      removeSelection();
      getLinkSelected();
      document.execCommand('copy');
    });
    modal.open();
    $shareBtn.classList.remove('sharing');
    $shareBtn.disabled = false;
    if (note && note.hash) {
      setUrl(note.hash);
    }
  };

  const share = () => {
    $shareBtn.classList.add('sharing');
    $shareBtn.disabled = true;
    let generateHash = new Promise((res, rej) => {
      const hash = genId();
      const queryBuilder = Backendless.DataQueryBuilder.create();
      queryBuilder.setWhereClause(`hash='${hash}'`);
      Backendless.Data.of('notes').getObjectCount(queryBuilder)
      .then(count => count.length ? share() : res(hash))
      .catch(err => console.error(err));
    });
    generateHash
    .then(hash => saveNote(hash))
    .catch(err => console.log(err));
  };

  const getNote = hash => {
    const queryBuilder = Backendless.DataQueryBuilder.create();
    queryBuilder.setWhereClause(`hash='${hash}'`);
    Backendless.Data.of('notes').find(queryBuilder)
    .then(notes => m.setValue(notes[0].value))
    .catch(err => console.error(err));
  };

  const $shareBtn = s1('.download .share');
  const m = new Markdown(s1('markdown'));
  m.init();
  initBackend();

  on(s('.download button'), 'click', download);
  on($shareBtn, 'click', share);
  if (location.search && location.search.startsWith('?note=')) {
    const hash = location.search.substring(location.search.indexOf('=') + 1);
    getNote(hash);
  }
})();
