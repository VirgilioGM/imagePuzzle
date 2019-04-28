var $ = jQuery;

var lang = document.documentElement.lang.includes('es')? 'es' : 'en';
var strings = {
  'en': {
    'rows': 'Rows',
    'cols': 'Columns',
    'img': 'Image',
    'fileNone': 'None',
    'create': 'Create puzzle',
    'creating': 'Creating puzzle',
    'title1': 'Well done!',
    'title2': 'You are a crack!',
    'title3': 'You are amazing!',
    'hooked': 'I love that you\'re having a good time but maybe you should think about doing something else... ;P',
    'moves': 'Moves',
    'wins': 'Wins',
    'time': 'Time',
    'best': 'Best time',
    'record': 'NEW RECORD!',
    'hour': 'hour',
    'minute': 'minute',
    'second': 'second',
    'winText': 'Would you like to play again?',
    'playAgain': 'Accept',
    'cancel': 'Cancel',
    'fileFormatError': 'Invalid file type. The supported formats are JPG and PNG'
  },
  
  'es': {
    'rows': 'Filas',
    'cols': 'Columnas',
    'img': 'Imagen',
    'fileNone': 'Ninguna',
    'create': 'Crear puzzle',
    'creating': 'Creando puzzle',
    'title1': '¡Bien hecho!',
    'title2': '¡Eres una máquina!',
    'title3': '¡Eres increíble!',
    'hooked': 'Me encanta que te lo estés pasando bien pero igual deberías ir pensando en hacer otra cosa... ;P',
    'moves': 'Movimientos',
    'wins': 'Victorias',
    'time': 'Tiempo',
    'best': 'Mejor tiempo',
    'record': '¡NUEVO RECORD!',
    'hour': 'hora',
    'minute': 'minuto',
    'second': 'segundo',
    'winText': '¿Quieres volver a jugar?',
    'playAgain': 'Aceptar',
    'cancel': 'Cancelar',
    'fileFormatError': 'Tipo de archivo inválido. Los formatos soportados son JPG y PNG'
  }
};

var creating  = false,
    canStart  = false,
    canClick  = false,
    playing   = false,
    cols      = 4,
    rows      = 4,
    image     = new Image(),
    moves     = 0,
    wins      = 0,
    startTime = 0,
    totalTime = 0,
    bestTime  = 0;

var blankImg = {
  'id':  '',
  'src': '',
  'row': 0,
  'col': 0
};

$('#rows-text').text(strings[lang].rows);
$('#cols-text').text(strings[lang].cols);
$('#img-text').text(strings[lang].img);
$('#file-name').text(strings[lang].fileNone);
$('#file-name').css( "maxWidth", $('#file-block').width() - $('#file-label').width());
$('#create-button-text').text(strings[lang].create);
$('#create-button-loading-text').text(strings[lang].creating);

$('#file').change(function(){
  var file = $('#file')[0].files[0];
  if (!file){
    $('#file-name').text(strings[lang].fileNone);
  } else if (file && file.type != 'image/jpeg' && file.type != 'image/png' && file.type != 'image/x-png'){
    $('#file').val('');
    $('#file-name').text(strings[lang].fileNone);
    $('#file-error-text').text(strings[lang].fileFormatError);
    $('#file-error-text').show();
  } else {
    $('#file-name').text(file.name);
    $('#file-error-text').hide();
  }
});

$('#puzzle-form').submit(function(){
  rows = $('#rows').val() || 4;
  cols = $('#cols').val() || 4;
  var file = $('#file')[0].files[0];
  
  if (rows < 2 || rows > 10 ||
      cols < 2 ||cols > 10 ||
      ! file) return false;

  $('#create-button-text').hide();
  $('#create-button-loading').show();
  getBase64(file).then(function(base64File){
    image.onload = function(){};
    image.src = '';
    image.onload = createPuzzle;
    image.src = base64File;
  });
  return false;
});

function getBase64(file){
  return new Promise(function(resolve, reject){
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(){
      return resolve(reader.result);
    };
    reader.onerror = function(error){
      return reject(error);
    };
  });
}

function createPuzzle(){
  creating = true;
  canStart = false;
  canClick = false;
  playing  = false;

  var imgs = [],
      pieceWidth = image.naturalWidth / cols,
      pieceHeight = image.naturalHeight / rows;

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var canvas = document.createElement('canvas');
      canvas.width = pieceWidth;
      canvas.height = pieceHeight;
      var ctxt = canvas.getContext('2d');
      ctxt.drawImage(image, j * pieceWidth, i * pieceHeight, pieceWidth, pieceHeight, 0, 0, canvas.width, canvas.height);

      var img = new Image();
      img.src = canvas.toDataURL();
      img.dataset.target = i+'-'+j;
      imgs.push(img);
    }
  }

  var table = document.getElementById('puzzle-table');
  var tableBody = table.children[0];
  tableBody.innerHTML = '';

  for (var i = 0; i < rows; i++) {
    var tr = document.createElement('tr');

    for (var j = 0; j < cols; j++) {
      (function(){
        var td = document.createElement('td');
        td.style.width = 100 / cols + '%';
        td.style.height = 100 / rows + '%';

        var idx = Math.floor(Math.random() * imgs.length);
        var img = $(imgs.splice(idx, 1)[0]);
        img.attr('id', 'img'+i+j);
        var duration = (Math.floor(Math.random() * 10) / 10) + 0.4;
        var delay = (Math.floor(Math.random() * 10) / 10) + 0.4;
        img.css('-webkit-animation', 'slideUp ' + duration + 's ease ' + delay + 's');
        img.css('animation', 'slideUp ' + duration + 's ease ' + delay + 's');

        var imgDOM = img[0];
        imgDOM.onclick = function(event){
          imgClick(event, imgDOM);
        };
        
        td.appendChild(imgDOM);
        tr.appendChild(td);

        setTimeout(function(){
          $(img).css('transform', 'none');
          setTimeout(function(){
            $(img).css('-webkit-animation', 'none');
            $(img).css('animation', 'none');
          }, duration * 1000);
        }, delay * 1100);
      })();
    }

    tableBody.appendChild(tr);
  }

  $('#create-button-loading').hide();
  $('#create-button-text').show();
  creating = false;
  setTimeout(function(){
    canStart = true;
    gameStart();
  }, 2500);
}

function gameStart(){
  if (!canStart || playing) return;
  playing = true;
  startTime = (new Date()).getTime();
  moves = 0;
  
  var img00 = $('[data-target=0-0]');
  blankImg.id = img00.attr('id');
  blankImg.src = img00.attr('src');
  var rowAndCol = blankImg.id.substring(blankImg.id.length-2);
  blankImg.row = parseInt(rowAndCol[0]);
  blankImg.col = parseInt(rowAndCol[1]);
  img00.css('-webkit-animation', 'fade 1s');
  img00.css('animation', 'fade 1s');
  
  setTimeout(function(){
    img00.hide();
    img00.css('-webkit-animation', 'none');
    img00.css('animation', 'none');
    canClick = true;
  }, 950);
}

function imgClick(event, elem){
  if (!canClick || !playing) return;
  event.stopPropagation();
  var img = $(elem);
  var rowAndCol = img.attr('id').substring(img.attr('id').length-2);
  var imgRow = parseInt(rowAndCol[0]);
  var imgCol = parseInt(rowAndCol[1]);
  if (imgRow == blankImg.row && (imgCol == blankImg.col - 1) ||
      imgRow == blankImg.row && (imgCol == blankImg.col + 1) ||
      imgCol == blankImg.col && (imgRow == blankImg.row - 1) ||
      imgCol == blankImg.col && (imgRow == blankImg.row + 1)){
    moves++;
    
    $('#'+blankImg.id).attr('src', img.attr('src'));
    $('#'+blankImg.id).attr('data-target', img.attr('data-target'));
    $('#'+blankImg.id).show();

    img.attr('src', blankImg.src);
    img.attr('data-target', blankImg.row+'-'+blankImg.col);
    img.hide();
    
    blankImg.id = img.attr('id');
    blankImg.row = imgRow;
    blankImg.col = imgCol;
    
    checkImgs();
  }
}

function parseTime(ms){
  var seconds = ms / 1000;
  var hh = Math.floor(seconds / (60*60));
  var diff = seconds % (60*60);
  var mm =  Math.floor(diff / 60);
  var ss = Math.floor(diff % 60);

  var result = '';
  if (hh > 0) result += hh + ' ' + strings[lang].hour;
  if (hh > 1) result += 's';
  
  if (hh > 0 && mm > 0) result += ', ';
  
  if (mm > 0) result += mm + ' ' + strings[lang].minute;
  if (mm > 1) result += 's';
  
  if (mm > 0 && ss > 0) result += ', ';
  
  if (ss > 0) result += ss + ' ' + strings[lang].second;
  if (ss > 1) result += 's';
  
  return result;
}

function checkImgs(){
  var imgs = $('#puzzle img');
  for (var i=0; i<imgs.length; i++){
    if (imgs[i].id == 'img00') continue;
    
    var imgRowAndCol = imgs[i].id.substring(imgs[i].id.length-2);
    var targetRowAndCol = imgs[i].dataset.target.split('-').join('');
    if (imgRowAndCol != targetRowAndCol) return;
  }

  $('#puzzle #img00').show();
  playing = false;
  totalTime = (new Date()).getTime() - startTime;
  if (!bestTime) bestTime = totalTime;
  wins++;
  
  setTimeout(function(){
    var title;
    if (wins < 5) title = strings[lang].title1;
    else if (wins < 8) title = strings[lang].title2;
    else title = strings[lang].title3;
    
    var msg = '';
    if (wins > 9 && wins % 5 == 0) msg += strings[lang].hooked + '<br><br>';
    msg += strings[lang].moves + ': ' + moves + '<br>';
    if (wins > 1) msg += strings[lang].wins + ': ' + wins + '<br>';
    msg += strings[lang].time + ': ' + parseTime(totalTime);
    if (wins > 1){
      if (bestTime > totalTime){
        msg += ' - ' + strings[lang].record;
        bestTime = totalTime;
      } else msg += '<br>' + strings[lang].best + ': ' + parseTime(bestTime);
    }
    msg += '<br><br>' + strings[lang].winText;

    $('#dialog-confirm').html(msg);
    $('#dialog-confirm').dialog({
      resizable: false,
      height: 'auto',
      width: 400,
      modal: true,
      title: title,
      buttons: {
        [strings[lang].cancel]: function(){
          $(this).dialog('close');
        },
        [strings[lang].playAgain]: function(){
          $('#create-button-text').hide();
          $('#create-button-loading').show();
          $(this).dialog('close');
          createPuzzle();
          setTimeout(function(){
            gameStart();
          }, 2500);
        }
      }
    });
  }, 300);
}
