let selFilter, sliderSensitivity, sliderHue, sliderBrightness;
let buttonBN, btnOn = false;
let capture;
var mic, fft;
let bgColor = '#343434';
let bgColorWhite = '#ffffff'; //???
let spectrum;
const scaler = 8;
const scalerMin = 5;
let margin = 30;

function setup() {
  createCanvas(780, 666, P2D); //780, 586 + 80px per comandi — 4:3
  capture = createCapture(VIDEO);
  capture.hide();
  capture.size(780, 586);
  captureScaled = createCapture(VIDEO);
  captureScaled.hide();
  captureScaled.size(780/scaler, 586/scaler);
  captureScaledMin = createCapture(VIDEO);
  captureScaledMin.hide();
  captureScaledMin.size(780/scalerMin, 586/scalerMin);
  colorMode(HSB, 100);
  
  mic=new p5.AudioIn();
  mic.start();
  var smoothing = 0.8;
  var bins = 512;
  fft = new p5.FFT(smoothing, bins);
  
  //hic sunt comandes
  selFilter = createSelect();
  selFilter.position(margin+5, height-80+margin);
  selFilter.size(140);
  selFilter.option('Symmetric Amp');
  selFilter.option('Painting Glitch');
  selFilter.option('3D Particles');
  selFilter.option('8-bit Posterization');
  selFilter.selected('Symmetric Amp');
  selFilter.changed(mySelectEvent1);
  
  sliderSensitivity = createSlider(50, 180, 110, 10);
  sliderSensitivity.position(selFilter.x + selFilter.width + margin, selFilter.y);
  sliderSensitivity.style('width', '120px');
  //sliderSensitivity.style('height', '40px'); //???

  sliderHue = createSlider(0, 350, 100, 10);
  sliderHue.position(sliderSensitivity.x + sliderSensitivity.width + margin, selFilter.y);
  sliderHue.style('width', '120px');

  sliderBrightness = createSlider(0, 100, 100, 10);
  sliderBrightness.position(sliderHue.x + sliderHue.width + margin, selFilter.y);
  sliderBrightness.style('width', '120px');

  buttonBN = createButton('INVERT BACKGROUND');
  buttonBN.size(100, 35);
  buttonBN.position(sliderBrightness.x + sliderBrightness.width + margin, selFilter.y);
  buttonBN.mousePressed(BlackWhite);

}

function draw() {

  if (btnOn == true) {
    buttonBN.style('background-color', color(0, 0, 100))
  } else {
    buttonBN.style('background-color', color(0, 0, 60))
  }

  push();

  if (selFilter.value() == 'Symmetric Amp') {
    SymmetricAmp();
  } if (selFilter.value() == 'Painting Glitch') {
    PaintingGlitch();
  } if (selFilter.value() == '3D Particles') {
    Particles();
  } if (selFilter.value() == '8-bit Posterization') {
    Posterization();
  }

  pop();
  
  fill(100, 0, 85);
  noStroke();
  rect(0, height-80, width, 80);

  push();
  fill(0, 0, 0);
  textSize(10);
  textAlign(LEFT);
  text("FILTER", selFilter.x-5, selFilter.y+margin);
  text("SENSITIVITY", sliderSensitivity.x-5, sliderSensitivity.y+margin);
  text("HUE", sliderHue.x-5, sliderHue.y+margin);
  text("BRIGHTNESS", sliderBrightness.x-5, sliderBrightness.y+margin);
  pop();
}

function mySelectEvent1() {
  clear();
  let item = selFilter.value();
}

//ghost n.1
function SymmetricAmp() {
  var level=pow(mic.getLevel(),0.5);
  var spectrum = fft.analyze();
  fft.setInput(mic);

  if (btnOn == true) {
    background(bgColorWhite);
  } else {
    background(bgColor);
  }
  
  if (capture.width > 0) {
    let img = capture.get(0, 0, capture.width, capture.height);
    img.loadPixels();

    const step = 6;

    let val = map(sliderSensitivity.value(), 50, 180, 0.2, 1);
    let color = map(sliderHue.value(), 0, 350, 0, 60);
    let bright = sliderBrightness.value();

    for (var y = height-80; y > 0; y -= step) {
      for (var x = width/2; x < img.width; x += step) {
        const darkness = getPixelDarknessAtPosition(img, x, y);
        let sX = x;
        let sY = y;
        var pulse = spectrum[map(x, width/2, width, 0, width/2)];
        
        if (darkness > val) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)+color),100,bright);
          circle(sX, sY, map(pulse,0,255,2,14));
        } else if (darkness > val/2) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)+color),100,bright);
          rect(sX, sY, map(pulse,0,255,2,14));
        } else {
          strokeWeight(4);
          stroke(((darkness*100)-map(level, 0, 1, 0, 100)+color),100,bright);
          line(sX, sY, sX+map(pulse,0,255,0,5), sY);
        }
      }
    }

    for (var y = height-80; y > 0; y -= step) {
      for (var x = width/2; x > 0; x -= step) {
        const darkness = getPixelDarknessAtPosition(img, x, y);
        let sX = x;
        let sY = y;
        var pulse = spectrum[map(x, width/2, 0, 0, width/2)];
        
        if (darkness > val) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)+color),100,bright);
          circle(sX, sY, map(pulse,0,255,2,15));
        } else if (darkness > val/2) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)+color),100,bright);
          rect(sX, sY, map(pulse,0,255,2,15));
        } else {
          strokeWeight(4);
          stroke(((darkness*100)-map(level, 0, 1, 0, 100)+color),100,bright);
          line(sX, sY, sX+map(pulse,0,255,0,step), sY);
        }
      }         
    }
  }
}

//ghost n.2
function PaintingGlitch() {
  var level=pow(mic.getLevel(),0.5);
  var spectrum = fft.analyze();
  fft.setInput(mic);
  
  capture.loadPixels();
  translate(capture.width, 0);
  scale(-1, 1);

  let val = map(sliderSensitivity.value(), 50, 180, 200, 1800);
  let color = map(sliderHue.value(), 0, 350, 0, 1);
  let bright = map(sliderBrightness.value(), 0, 100, 0.1, 1);
  
  for (var i=0; i<val; ++i) {

    var x = int(random(capture.width));
    var y = int(random(capture.height));
    var pix = (x + y*capture.width) * 4;        
    var col = capture.pixels.slice( pix, pix+6 );

    var frequency_2 = spectrum[250];
    if (btnOn == true) {
      var frequency_3 = spectrum[1];
      var frequency_1 = spectrum[500];
      fill((col[0]*color)*map(frequency_1, 0, 255, 0.25, 1.5), col[1]*map(frequency_2, 0, 255, 0.25, 1.5), (col[2]*bright)*map(frequency_3, 0, 255, 1, 1.5)); 
      noStroke();
      rect( x, y , map(frequency_3, 0, 255, 2, 20) , map(frequency_2, 0, 255, 3, 30) , map(frequency_1, 0, 255, 5, 30) ) ;
    } else {
      var frequency_1 = spectrum[1];
      var frequency_3 = spectrum[500];
      fill((col[0]*color)*map(frequency_1, 0, 255, 0.25, 1.5), col[1]*map(frequency_2, 0, 255, 0.25, 1.5), (col[2]*bright)*map(frequency_3, 0, 255, 1, 1.5)); 
      noStroke();
      rect( x, y , map(frequency_1, 0, 255, 2, 20) , map(frequency_2, 0, 255, 3, 30) , map(frequency_3, 0, 255, 5, 30) ) ;
    }
  }
}

//ghost n.3
function Particles() {

  let val = map(sliderSensitivity.value(), 50, 180, 4, 16);
  let color = map(sliderHue.value(), 0, 350, 0, .45);
  let bright = map(sliderBrightness.value(), 0, 100, 0.1, 1);

  if (btnOn == true) {
    background(bgColorWhite);
  } else {
    background(bgColor);
  }
  
  translate(width-val/2, 0);
  scale(-1,1);
  
  var levAmp = mic.getLevel();
  var level = pow(mic.getLevel(), .5);
  var levMap = map(levAmp, 0, 0.1, 0, 3);
  var spectrum = fft.analyze();
  fft.setInput(mic);
  var bass = fft.getEnergy("bass");
  var mid = fft.getEnergy("mid");
  var treb = fft.getEnergy("treble");
  captureScaled.loadPixels();
  
  var numX = captureScaled.width;
  var numY = captureScaled.height;
  
  for (var j = 0; j < numY; j++){
   beginShape();
   for (var i = 0; i < numX; i++){
     pos= 4*(j*captureScaled.width+i);
     var r=captureScaled.pixels[pos];
     var g=captureScaled.pixels[pos+1];
     var b=captureScaled.pixels[pos+2];
     var br= (r + g + b)/3;
     
     var x = (scaler * i) + map(br, 0, 255, -val, val);
     var y = (scaler * j) + map(br, 0, 255, -val, val);
     
     /*if (x<width/2) {
       var x = x - map(x, width/2, 0, 0, 100)*map(mid, 0, 255, 0, 2);
     } else {
       var x = x - map(x, 0, width/2, 100, 0)*map(bass, 0, 255, 0, 2); //qui bass? aggiungere treb?
     }
     
     if (y<height/2) {
       var y = y - map(y, width/2, 0, 0, 100)*map(mid, 0, 255, 0, 2);
     } else {
       var y = y - map(y, 0, width/2, 100, 0)*map(mid, 0, 255, 0, 2);
     }*/
     
     var spec = spectrum[j];
     stroke(map(bass, 100, 240, 0, 360)*color, mid, map(treb, 0, 50, 0, 100)*bright);
     noFill();
     //strokeWeight(map(br, 0, 255, 0, 6)*map(mid, 0, 255, 0, 5));
     strokeWeight(map(mid, 0, 255, 1, 5));
     //fill(r, g, b);
     //point(x, y);
     vertex(x, y);
   }
   endShape();
 }
}

//ghost n.4
function Posterization() {
  background(40);
  
  translate(width, 0);
  scale(-1,1);
  
  var level=mic.getLevel();
  var levmap = 4*map(level,0,1,0,140);
  var spectrum = fft.analyze();
  fft.setInput(mic);
  
  captureScaledMin.loadPixels();
  let val = sliderSensitivity.value();
  let color = map(sliderHue.value(), 0, 350, 0.1, 1);
  let bright = map(sliderBrightness.value(), 0, 100, 10, 100);

  if (btnOn == true) {
    var alti = map(fft.getEnergy("bass"), 80,240,0,40);
    var bass = map(fft.getEnergy("treble"), 0,30,40,60); //verde blu
  } else {
    var bass = map(fft.getEnergy("bass"), 80,240,0,40);
    var alti = map(fft.getEnergy("treble"), 0,30,40,60); //verde blu
  }

  
  var medi = map(fft.getEnergy("mid"), 100,150,0,100);// blu,azzuro,viola

  for (var y = 0; y < captureScaledMin.height; y ++) {
    for (var x = 0; x < captureScaledMin.width; x ++) {

    pixpos=(x+y*captureScaledMin.width)*4

    r=captureScaledMin.pixels[pixpos]
    g=captureScaledMin.pixels[pixpos+1]
    b=captureScaledMin.pixels[pixpos+2]
    var darkness=(r+g+b)/3
    
    var bassi = map(bass,0,250,0,255);//giallo arancio rosso

    if (darkness>levmap+val){
      //fill(alti, 70, map(medi, 0, 255, 70, 100));}
      fill(alti*color, 80, bright);}
    else{
      fill(bassi*color, 80, bright);}

    rectMode(CENTER);
    noStroke();
    rect(x*scalerMin,y*scalerMin,10);
    }
  }
}

function BlackWhite() {
  btnOn = !btnOn;
}

function getPixelDarknessAtPosition(img, x, y) {
  const mirroring = true;
  var i = y * img.width + (mirroring ? (img.width - x - 1) : x);
  return (255 - img.pixels[i * 4]) / 255;
}