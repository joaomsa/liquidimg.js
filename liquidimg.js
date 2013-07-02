'use strict';

var orig_canvas = document.getElementById('original');
var desat_canvas = document.getElementById('desaturated');
var sobel_canvas = document.getElementById('sobel');
var carved_canvas = document.getElementById('seam-carved');

var img = new Image();
img.src = 'woman.jpg';

img.onload = function(){
    orig_canvas.setAttribute('width', img.width);
    orig_canvas.setAttribute('height', img.height);

    desat_canvas.setAttribute('width', img.width);
    desat_canvas.setAttribute('height', img.height);

    sobel_canvas.setAttribute('width', img.width);
    sobel_canvas.setAttribute('height', img.height);

    carved_canvas.setAttribute('width', img.width - 100);
    carved_canvas.setAttribute('height', img.height);

    var orig_ctx = orig_canvas.getContext('2d');
    orig_ctx.drawImage(img, 0, 0);
    var orig_img = orig_ctx.getImageData(0, 0, img.width, img.height);

    var desat_img = orig_ctx.getImageData(0, 0, img.width, img.height);
    var desat_ctx = desat_canvas.getContext('2d');
    desaturate(desat_img);
    desat_ctx.putImageData(desat_img, 0, 0);

    var sobel_img = orig_ctx.getImageData(0, 0, img.width, img.height);
    var sobel_ctx = sobel_canvas.getContext('2d');
    sobel_magnitude(sobel_img);
    sobel_ctx.putImageData(sobel_img, 0, 0);

    var carved_img = orig_ctx.getImageData(0, 0, img.width - 100, img.height);
    var carved_ctx = carved_canvas.getContext('2d');
    carved_ctx.putImageData(carved_img, 0, 0);
}

function desaturate(img){
    for (var i = 0; i < img.data.length; i += 4){
        var lumiminosity = 0.30 * img.data[i]
                         + 0.59 * img.data[i + 1]
                         + 0.11 * img.data[i + 2];
        lumiminosity = Math.round(lumiminosity);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = lumiminosity;
    }
}

function sobel_magnitude(img, kernel){
    function index(x, y){ return (y * img.width + x) * 4 }

    var Sx = [[-1, 0, 1], 
              [-2, 0, 2], 
              [-1, 0, 1]];
    var Sy = [[-1,-2,-1], 
              [ 0, 0, 0], 
              [ 1, 2, 1]];

    var sobel_data = new Uint8ClampedArray(img.data.length);

    for (var x = 0; x < img.width; x++){
        for (var y = 0; y < img.height; y++){

            var Gx = 0, Gy = 0;
            for (var k_x = 0; k_x < 3; k_x++){
                for (var k_y = 0; k_y < 3; k_y++){
                    // Wrap around to deal with border pixels.
                    var i_x = (x - 1 + k_x + img.width) % img.width;
                    var i_y = (y - 1 + k_y + img.height) % img.height;
                    var i = index(i_x, i_y)

                    Gx += img.data[i] * Sx[k_x][k_y];
                    Gy += img.data[i] * Sy[k_x][k_y];
                }
            }
            var magnitude = Math.round(Math.sqrt(Gx * Gx + Gy * Gy));
            // Clamp value between 0 and 255.
            magnitude = Math.min(Math.max(magnitude, 0), 255);

            var i = index(x, y);
            sobel_data[i] = sobel_data[i + 1] = sobel_data[i + 2] = magnitude;
            sobel_data[i + 3] = img.data[i + 3];
        }
    }

    for (var i = 0; i < img.data.length; i++)
        img.data[i] = sobel_data[i];
}
