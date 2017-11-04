(() => {
  const s1 = (s, context) => Array.from((document || context).querySelector(s));
  const s = (s, context) => Array.from((document || context).querySelectorAll(s));
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

  const m = new Markdown(s1('markdown'));
  m.init();

  on(s('.download button'), 'click', e => {
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
      console.error('There is no data!');
      return;
    }
    new Downloader(data, `markdown.${type}`);
  });
})();
