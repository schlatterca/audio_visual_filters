let selFilter, sliderColor;
let capture;
var mic, fft;
let bgColor = '#343434';
let spectrum;
const scaler = 8;
const scalerMin = 5;
let margin = 20;

function setup() {
  createCanvas(780, 746, P2D); //780, 586 + 160px per comandi
  capture = createCapture(VIDEO);
  capture.hide();
  capture.size(780, 586);
  captureScaled = createCapture(VIDEO);
  captureScaled.hide();
  captureScaled.size(780/scaler, 586/scaler);
  captureScaledMin = createCapture(VIDEO);
  captureScaledMin.hide();
  captureScaledMin.size(780/scalerMin, 586/scalerMin);
  colorMode(HSB,100);
  
  mic=new p5.AudioIn();
  mic.start();
  var smoothing = 0.8;
  var bins = 512; //16
  fft = new p5.FFT(smoothing, bins);
  
  //hic sunt comandes
  selFilter = createSelect();
  selFilter.position(margin, height-160+margin);
  selFilter.size(180, 40);
  selFilter.option('Symmetric Amp');
  selFilter.option('Painting Glitch');
  selFilter.option('3D Particles');
  selFilter.option('8-bit Posterization');
  selFilter.selected('Symmetric Amp');
  selFilter.changed(mySelectEvent1);
  
  sliderColor = createSlider(40, 200, 0, 2);
  sliderColor.position(selFilter.x + selFilter.width + margin, selFilter.y);
  sliderColor.style('width', '80px');
}

function draw() {

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
  rect(0, height-160, width, 160);
}

function mySelectEvent1() {
  clear();
  let item = selFilter.value();
}

//filter n.1
function SymmetricAmp() {
  var level=pow(mic.getLevel(),0.5);
  var spectrum = fft.analyze();
  fft.setInput(mic);
  
  background(bgColor);
  
  if (capture.width > 0) {
    let img = capture.get(0, 0, capture.width, capture.height);
    img.loadPixels();

    const step = 6;

    for (var y = height-160; y > 0; y -= step) {
      for (var x = width/2; x < img.width; x += step) {
        const darkness = getPixelDarknessAtPosition(img, x, y);
        let sX = x;
        let sY = y;
        var pulse = spectrum[map(x, width/2, width, 0, width/2)];
        
        if (darkness > 0.6) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)),100,100);
          circle(sX, sY, map(pulse,0,255,2,14));
        } else if (darkness > 0.3) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)),100,100);
          rect(sX, sY, map(pulse,0,255,2,14));
        } else {
          strokeWeight(4);
          stroke(((darkness*100)-map(level, 0, 1, 0, 100)),100,100);
          line(sX, sY, sX+map(pulse,0,255,0,5), sY);
        }
      }
    }

    for (var y = height-160; y > 0; y -= step) {
      for (var x = width/2; x > 0; x -= step) {
        const darkness = getPixelDarknessAtPosition(img, x, y);
        let sX = x;
        let sY = y;
        var pulse = spectrum[map(x, width/2, 0, 0, width/2)];
        
        if (darkness > 0.6) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)),100,100);
          circle(sX, sY, map(pulse,0,255,2,15));
        } else if (darkness > 0.3) {
          noStroke()
          fill(((darkness*100)-map(level, 0, 1, 0, 100)),100,100);
          rect(sX, sY, map(pulse,0,255,2,15));
        } else {
          strokeWeight(4);
          stroke(((darkness*100)-map(level, 0, 1, 0, 100)),100,100);
          line(sX, sY, sX+map(pulse,0,255,0,step), sY);
        }
      }         
    }
  }
}

//filter n.2
function PaintingGlitch() {
  var level=pow(mic.getLevel(),0.5);
  var spectrum = fft.analyze();
  fft.setInput(mic);
  
  capture.loadPixels();
  translate(capture.width, 0);
  scale(-1, 1);
  
  for (var i=0; i<1000; ++i) {
    
    var frequency_1 = spectrum[1];
    var frequency_2 = spectrum[250];
    var frequency_3 = spectrum[500];

    var x = int(random(capture.width));
    var y = int(random(capture.height));
    var pix = (x + y*capture.width) * 4;        
    var col = capture.pixels.slice( pix, pix+6 );

    fill(col[0]*map(frequency_1, 0, 255, 0.25, 1.5), col[1]*map(frequency_2, 0, 255, 0.25, 1.5), col[2]*map(frequency_3, 0, 255, 1, 1.5)); 
    noStroke();
    rect( x, y , map(frequency_1, 0, 255, 2, 20) , map(frequency_2, 0, 255, 3, 30) , map(frequency_3, 0, 255, 5, 30) ) ;
  }
}

//filter n.3
function Particles() {
  
  translate(width, 0);
  scale(-1,1);
  
  var levAmp = mic.getLevel();
  var level = pow(mic.getLevel(),0.5);
  var levMap = map(levAmp, 0, 0.1, 0, 3);
  var spectrum = fft.analyze();
  fft.setInput(mic);
  var bass = fft.getEnergy("bass");
  var mid = fft.getEnergy("mid");
  var treb = fft.getEnergy("treble");
  captureScaled.loadPixels();
  background(0);
  
  var numX = captureScaled.width;
  var numY = captureScaled.height;
  var cX = (numX - 1) * scaler / 2;
  var cY = (numY - 1) * scaler / 2;
  
 for (var j = 0; j < numY; j++){
   beginShape();
   for (var i = 0; i < numX; i++){
     pos=4 *(j*captureScaled.width+i);
     var r=captureScaled.pixels[pos];
     var g=captureScaled.pixels[pos+1];
     var b=captureScaled.pixels[pos+2];
     var br= (r + g + b)/3;
     
     var x = (scaler * i) + map(br, 0, 255, -10, 10);
     var y = (scaler * j) + map(br, 0, 255, -10, 10);
     
     if (x<width/2) {
       var x = x - map(x, width/2, 0, 0, 100)*map(mid, 0, 255, 0, 2);
     } else {
       var x = x - map(x, 0, width/2, 100, 0)*map(bass, 0, 255, 0, 2); //qui bass? aggiungere treb?
     }
     
     if (y<height/2) {
       var y = y - map(y, width/2, 0, 0, 100)*map(mid, 0, 255, 0, 2);
     } else {
       var y = y - map(y, 0, width/2, 100, 0)*map(mid, 0, 255, 0, 2);
     }
     
     var spec = spectrum[j];
     stroke(map(bass, 100, 240, 0, 360), mid, map(treb, 0, 30, 30, 100));
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

//filter 4
function Posterization() {
  background(40);
  
  //var level=pow(mic.getLevel(),0.5);
  var level=mic.getLevel();
  var levmap = 4*map(level,0,1,0,140);
  var spectrum = fft.analyze();
  fft.setInput(mic);
  
  captureScaledMin.loadPixels();
  translate(capture.width, 0);
  scale(-1, 1);
  
  let val = sliderColor.value();

  var bassi = map(fft.getEnergy("bass"), 0,255,0,150);
  var medi = map(fft.getEnergy("mid"), 0,150,0,100);// blu,azzuro,viola
  var alti = map(fft.getEnergy("treble"), 0,20,90,200);//verde blu

  for (var y = 0; y < captureScaledMin.height; y ++) {
    for (var x = 0; x < captureScaledMin.width; x ++) {

    pixpos=(x+y*captureScaledMin.width)*4

    r=captureScaledMin.pixels[pixpos]
    g=captureScaledMin.pixels[pixpos+1]
    b=captureScaledMin.pixels[pixpos+2]
    var darkness=(r+g+b)/3
    
    //var bassi = map(bass,0,250,0,255);//giallo arancio rosso

    if (darkness>levmap+val){
      //fill(alti, 70, map(medi, 0, 255, 70, 100));}
      fill(alti, 70, 100);}
    else{
      fill(bassi, 70, 100);}

    rectMode(CENTER);
    noStroke();
    rect(x*scalerMin,y*scalerMin,10);
    }
  }
  console.log(bassi);
}

//function: get darkness
function getPixelDarknessAtPosition(img, x, y) {
  const mirroring = true;
  var i = y * img.width + (mirroring ? (img.width - x - 1) : x);
  return (255 - img.pixels[i * 4]) / 255;
}