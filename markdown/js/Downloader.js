(global => {
  class Downloader {
    constructor (data = '', filename = 'example', type = 'text/plain') {
      const file = new Blob([data], {type});
      const $anchor = document.createElement('a');
      const url = URL.createObjectURL(file);
      $anchor.href = url;
      $anchor.download = filename;
      $anchor.click();
      window.URL.revokeObjectURL(url);
    }
  }
  global.Downloader = Downloader;
})(window);
