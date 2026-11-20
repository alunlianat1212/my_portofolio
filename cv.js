(function () {
  var sheet = document.getElementById('sheet');
  var stage = document.getElementById('stage');
  var btnPrint = document.getElementById('btnPrint');
  var btnEdit = document.getElementById('btnEdit');
  var frame = document.getElementById('photoFrame');
  var photo = document.getElementById('profilePhoto');

  btnPrint.addEventListener('click', function () { window.print(); });

  btnEdit.addEventListener('click', function () {
    var on = sheet.getAttribute('contenteditable') !== 'true';
    sheet.setAttribute('contenteditable', on ? 'true' : 'false');
    sheet.classList.toggle('editing', on);
    btnEdit.setAttribute('aria-pressed', on ? 'true' : 'false');
    btnEdit.lastChild.textContent = on ? ' Selesai edit' : ' Edit teks di layar';
  });

  function fit() {
    var pxPerMm = 96 / 25.4;
    var w = 210 * pxPerMm, h = 297 * pxPerMm;
    var scale = Math.min(1, (window.innerWidth - 20) / w);
    sheet.style.transform = 'scale(' + scale + ')';
    stage.style.width = (w * scale) + 'px';
    stage.style.height = (h * scale) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  function checkPhoto() {
    if (photo.complete && photo.naturalWidth === 0) frame.classList.add('no-photo');
  }
  photo.addEventListener('error', function () { frame.classList.add('no-photo'); });
  checkPhoto();
})();
