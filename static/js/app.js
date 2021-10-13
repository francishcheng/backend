// set up basic variables for app
var script = document.createElement('script');
script.src = 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const send = document.querySelector('.send');
const train = document.querySelector('.train');
const calculate = document.querySelector('.calculate');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');
// disable stop button while not recording
let chunks = []
stop.disabled = true;

// visualiser setup - create web audio api context and canvas

let audioCtx;
let global_chunks = [];
let global_clip_name = [];
calculate.onclick = function(){
  alert('calculating');

  var fd = new FormData();

  for(var i=0;i<global_chunks.length;i++)
  {
    fd.append('file', global_chunks[i], 'blob');
  }
  for(var i=0;i<global_clip_name.length;i++)
  {
    fd.append('clipnames', global_clip_name[i]);
  }
  var settings = {
    "url": "/calculate/",
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": fd,
    cache: false,
  };
  $.ajax(settings).done(function (response) {
    alert('clips sent successfuly')
    console.log(response)
    var ele = document.getElementsByClassName("result");
    
    // ele[0].innerHTML = JSON.stringify(response);
    for (const [ key, value ] of Object.entries(response)) {
          console.log(key, value); 
          ele[0].innerHTML += (key + ' |||||| ' + value + '<br>' );
    }
  });  
}
train.onclick = function(){
  alert('trainingi, plz wait...');
  var fd = new FormData();
  fd.append('msg', 'training');
  var settings = {
    "url": "/train/",
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": fd,
    cache: false,

  };

  $.ajax(settings).done(function (response) {

    alert('training completed, model saved!')
  });  
}
send.onclick = function () {
  // console.log(global_chunks);
  // console.log(global_clip_name);
  var fd = new FormData();

  for(var i=0;i<global_chunks.length;i++)
  {
    fd.append('file', global_chunks[i], 'blob');
  }
  for(var i=0;i<global_clip_name.length;i++)
  {
    fd.append('clipnames', global_clip_name[i]);
  }
  var settings = {
    "url": "/save/",
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": fd,
    cache: false,
  };
  $.ajax(settings).done(function (response) {
    alert('clips sent successfuly')
  });  
}
const canvasCtx = canvas.getContext("2d");
//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function (stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    record.onclick = function () {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function () {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }

    mediaRecorder.onstop = function (e) {
      console.log("data available after MediaRecorder.stop() called.");

      const clipName = prompt('Enter a name for your sound clip?', 'My unnamed clip' + global_chunks.length.toString());

      const clipContainer = document.createElement('article');
      const clipLabel = document.createElement('p');
      const audio = document.createElement('audio');
      const deleteButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';

      if (clipName === null) {
        clipLabel.textContent = 'My unnamed clip'  + chunks.length.toString();
      } else {
        clipLabel.textContent = clipName;
      }
      global_clip_name.push(clipLabel.textContent);
      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");
      global_chunks.push(blob)

      deleteButton.onclick = function (e) {
        let evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }

      clipLabel.onclick = function () {
        const existingName = clipLabel.textContent;
        const newClipName = prompt('Enter a new name for your sound clip?');
        if (newClipName === null) {
          clipLabel.textContent = existingName;
        } else {
          clipLabel.textContent = newClipName;
        }
      }
    }

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
      // global_chunks.push(
      //     // new Blob(e.data, { 'type': 'audio/ogg; codecs=opus' })
      //     e.data
      // );
    }
  }

  let onError = function (err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
  console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for (let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

  }
}

window.onresize = function () {
  canvas.width = mainSection.offsetWidth;
}

window.onresize();

