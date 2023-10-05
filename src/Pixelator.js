import React, { useEffect, useRef, useState } from 'react';

function hsl_to_rgb(h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
// from http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function rgb_to_hsl(_r, _g, _b) {
  const r = _r / 255;
  const g = _g / 255;
  const b = _b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}
// from http://stackoverflow.com/a/13587077/1204332
function color_distance(v1, v2) {
  let d = 0;

  for (let i = 0; i < v1.length; i++) {
    d += (v1[i] - v2[i]) * (v1[i] - v2[i]);
  }
  return Math.sqrt(d);
};

function getCSSHsl(hsl) {
  return `hsl(${hsl[0]*360}, ${hsl[1]*100}%, ${hsl[2]*100}%)`;
}

function pixel_data_to_key(pixel_data) {
  // console.log(pixel_data)
  return pixel_data[0].toString() + '-' + pixel_data[1].toString() + '-' + pixel_data[2].toString();
}

function draw(img) {
  var canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  // img.style.display = 'none';
  var image_data = context.getImageData(0, 0, canvas.width, canvas.height);
  let data = image_data.data;


  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  data = context.getImageData(0, 0, canvas.width, canvas.height).data;

  const original_pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    const rgb = data.slice(i, i + 3);
    const hsl = rgb_to_hsl(rgb[0], rgb[1], rgb[2]);
    original_pixels.push(hsl);
  }

  const group_headers = [];
  const groups = {};
  for (let i = 0; i < original_pixels.length; i += 1) {
    if (group_headers.length == 0) {
      group_headers.push(original_pixels[i]);
    }
    let group_found = false;
    for (let j = 0; j < group_headers.length; j += 1) {
      // if a similar color was already observed
      if (color_distance(original_pixels[i], group_headers[j]) < 0.8) {
        group_found = true;
        if (!(pixel_data_to_key(original_pixels[i]) in groups)) {
          groups[pixel_data_to_key(original_pixels[i])] = group_headers[j];
        }
      }
      if (group_found) {
        break;
      }
    }
    if (!group_found) {
      if (group_headers.indexOf(original_pixels[i]) == -1) {
        group_headers.push(original_pixels[i]);
      }
      if (!(pixel_data_to_key(original_pixels[i]) in groups)) {
        groups[pixel_data_to_key(original_pixels[i])] = original_pixels[i];
      }
    }
  }
  console.log(group_headers);
  posterize(context, image_data, groups)
}


function posterize(context, image_data, palette) {
  for (var i = 0; i < image_data.data.length; i += 4) {
    let rgb = image_data.data.slice(i, i + 3);
    const hsl = rgb_to_hsl(rgb[0], rgb[1], rgb[2]);
    const key = pixel_data_to_key(hsl);
    if (key in palette) {
      const new_hsl = palette[key];

      const new_rgb = hsl_to_rgb(new_hsl[0], new_hsl[1], new_hsl[2]);
      rgb = hsl_to_rgb(hsl);
      image_data.data[i] = new_rgb[0];
      image_data.data[i + 1] = new_rgb[1];
      image_data.data[i + 2] = new_rgb[2];
    }
  }
  context.putImageData(image_data, 0, 0);
}

// function getColor({ r, g, b, a }) {
//   const new_rgb = hsl_to_rgb(new_hsl[0], new_hsl[1], new_hsl[2]);

// }


function pixelateImage(originalImage, pixelationFactor) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const originalWidth = originalImage.width;
  const originalHeight = originalImage.height;
  const canvasWidth = originalWidth;
  const canvasHeight = originalHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.drawImage(originalImage, 0, 0, originalWidth, originalHeight);
  const originalImageData = context.getImageData(
    0,
    0,
    originalWidth,
    originalHeight
  ).data;

  const result = [];
  const colorCollection = {};
  // const map;

  let newY = 0;
  if (pixelationFactor !== 0) {
    for (let y = 0; y < originalHeight; y += pixelationFactor) {
      newY += 1;
      let newX = 0;
      for (let x = 0; x < originalWidth; x += pixelationFactor) {
        newX += 1;
        // extracting the position of the sample pixel
        const pixelIndexPosition = (x + y * originalWidth) * 4;
        // drawing a square replacing the current pixels
        const hsl = rgb_to_hsl(
          originalImageData[pixelIndexPosition],
          originalImageData[pixelIndexPosition+1],
          originalImageData[pixelIndexPosition+2],
        );

        if (!(hsl in colorCollection)) {
          colorCollection[hsl.join('_')] = [ hsl ]
        }
        
        const color = 'rgba(' +
          originalImageData[pixelIndexPosition] + ',' + // r
          originalImageData[pixelIndexPosition + 1] + ',' + // g
          originalImageData[pixelIndexPosition + 2] + ',' + // b
          originalImageData[pixelIndexPosition + 3] / 255 //a
        + ')';

        const colorHsla = `hsla(${hsl[0]*360}, ${hsl[1]*100}%, ${hsl[2]*100}%, ${originalImageData[pixelIndexPosition + 3] / 255})`
        // const replaceHsl = JSON.parse(simularColor);
        // const colorHsla = `hsla(${replaceHsl[0]*360}, ${replaceHsl[1]*100}%, ${replaceHsl[2]*100}%, ${originalImageData[pixelIndexPosition + 3] / 255})`

        context.fillStyle = color;

        result.push({
          x: newX * scale,
          y: newY * scale,
          fill: colorHsla,
          // temp: simularColor,
        })
        
        context.fillRect(x, y, pixelationFactor, pixelationFactor);
      }
    }
  }


  const colors = Object.keys(colorCollection);
  colors.forEach(_hsl1 => {
    colors.forEach(_hsl2 => {
      if (color_distance(_hsl1.split('_'), _hsl2.split('_')) < 0.1) {
        colorCollection[_hsl1].push(_hsl2.split('_'));
      }
    })
  })

  console.log(colorCollection)

  return {
    data: result,
    base64Content: canvas.toDataURL(),
    colorCollection
  };
}


const scale = 20;

const Pixelator = ({ src }) => {

  const rootRef = useRef();
  const [ base64Data, setBase64Data  ] = useState();
  const [ data, setData ] = useState();
  const [ colorData, setColorData ] = useState();
  
  useEffect(() => {
    handleInitPixelator();
  }, [])

  function handlePreloadImage() {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.src = src;
      img.onload = function() {
        resolve(img);
      }
    })

  }
  
  async function handleInitPixelator() {
    const image = await handlePreloadImage();
    const { data, base64Content, colorCollection } = pixelateImage(image, scale);
    // setBase64Data(base64Content);
    setData(data)
    setColorData(Object.values(colorCollection));
  }

  return (
    <div ref={rootRef}>
      <img width="400px" height="400px" src={src} />
      {/* { base64Data && <img src={base64Data} /> } */}
      { data &&
        <svg width="400px" height="400px" viewBox={`0 0 ${data.at(-1).x} ${data.at(-1).y}`} viewPort={`0 0 ${data.at(-1).x} ${data.at(-1).y}`}>
          { data.map((_item, i) =>
            <rect key={i} width={scale * 1} height={scale * 1} {..._item} />
          ) }
        </svg>
      }
      <div>
      { colorData?.map((_group, i) =>
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
            { _group.map((_color, j) =>
              <div key={j} style={{ width: '10px', height: '10px', background: getCSSHsl(_color) }}></div>
            ) }
          </div>
        )
      }
      </div>
    </div>
  )
}

export default Pixelator;