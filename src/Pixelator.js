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

function getCSSHsl(hsl) {
  return `hsl(${Math.floor(hsl[0]*360)}, ${Math.floor(hsl[1]*100)}%, ${Math.floor(hsl[2]*100)}%)`;
}

function pixelateImage(originalImage, pixelationFactor) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const originalWidth = originalImage.width;
  const originalHeight = originalImage.height;
  const canvasWidth = originalWidth;
  const canvasHeight = originalHeight;
  const totalWidthQty = Math.floor(originalWidth / pixelationFactor);
  const totalHeightQty = Math.floor(originalWidth / pixelationFactor);

  console.log({ totalWidthQty, totalHeightQty })
  
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
  const pixelInfomation = {};
  // const map;

  let minHValue = 0.5;
  let maxHValue = 0.5;
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

        minHValue = Math.min(hsl[0], minHValue);
        maxHValue = Math.max(hsl[0], maxHValue);

        if (!(hsl.join('_') in colorCollection)) {
          colorCollection[hsl.join('_')] = [ [ newX, newY ] ]
        }
        else {
          colorCollection[hsl.join('_')].push([ newX, newY ]);
        }
        
        const color = 'rgba(' +
          originalImageData[pixelIndexPosition] + ',' + // r
          originalImageData[pixelIndexPosition + 1] + ',' + // g
          originalImageData[pixelIndexPosition + 2] + ',' + // b
          originalImageData[pixelIndexPosition + 3] / 255 //a
        + ')';

        // const colorHsla = `hsl(${Math.floor(hsl[0]*360)}, ${Math.floor(hsl[1]*100)}%, ${Math.floor(hsl[2]*100)}%)`
        const colorHsla = `hsla(${Math.floor(hsl[0]*360)}, ${Math.floor(hsl[1]*100)}%, ${Math.floor(hsl[2]*100)}%, ${originalImageData[pixelIndexPosition + 3] / 255})`

        context.fillStyle = color;

        result.push({
          x: newX * pixelationFactor,
          y: newY * pixelationFactor,
          fill: colorHsla,
          // temp: simularColor,
        })

        pixelInfomation[`${newX}_${newY}`] = {
          pos: `${newX}_${newY}`,
          color: hsl,
        };
        
        context.fillRect(x, y, pixelationFactor, pixelationFactor);
      }
    }
  }

  console.log({result})

  console.log(pixelInfomation);


  for (let x = 1; x <= totalWidthQty; x++) {
    for (let y = 1; y <= totalHeightQty; y++) {
      
      const leftTop = (x === 0 || y === 0) ? null : `${x-1}_${y-1}`;
      const centerTop = (y === 0) ? null : `${x}_${y-1}`;
      const rightTop = (x === totalWidthQty || y < 1) ? null : `${x+1}_${y-1}`;
      const leftCenter = x === 0 ? null : `${x-1}_${y}`;
      const rightCenter = x === totalWidthQty ? null : `${x+1}_${y}`;
      const leftBottom = (x === 0 || y === totalHeightQty) ? null : `${x-1}_${y+1}`;
      const centerBottom = y === totalHeightQty ? null : `${x}_${y+1}`;
      const rightBottom = (x === totalWidthQty || y === totalHeightQty) ? null : `${x+1}_${y+1}`;


      const siblings = [
        pixelInfomation[leftTop],
        pixelInfomation[centerTop],
        pixelInfomation[rightTop],
        pixelInfomation[leftCenter],
        pixelInfomation[rightCenter],
        pixelInfomation[leftBottom],
        pixelInfomation[centerBottom],
        pixelInfomation[rightBottom],
      ]
      

      pixelInfomation[`${x}_${y}`].siblings = siblings.map(_sibling => {
        if (_sibling) {
          const isSimularColor = _isSimularColor(pixelInfomation[`${x}_${y}`].color, _sibling.color, 0.2);
          return isSimularColor ? _sibling : undefined;
        }
      })
      pixelInfomation[`${x}_${y}`].siblings = pixelInfomation[`${x}_${y}`].siblings.filter(_sibling => !!_sibling);
    }
  }

  console.log(pixelInfomation);

  const myColor = [];
  for (let x = 1; x <= totalWidthQty; x++) {
    for (let y = 1; y <= totalHeightQty; y++) {
      const self = pixelInfomation[`${x}_${y}`];
      const currentColorItem = myColor?.find(_color => _color.pixels.includes(`${x}_${y}`));
      if (currentColorItem) {
        currentColorItem.colors = [ ...new Set([...currentColorItem.colors, ...self.siblings.map(_sibling => _sibling.color)]) ]
        currentColorItem.pixels = [ ...new Set([...currentColorItem.pixels, ...self.siblings.map(_sibling => _sibling.pos)]) ]

      }
      else {
        myColor.push({
          colors: [ self.color, ...self.siblings.map(_sibling => _sibling.color) ],
          pixels: [ self.pos, ...self.siblings.map(_sibling => _sibling.pos) ]
        })
      }
    }
  }
  
  console.log(myColor)








  function _isSimularColor(_v1, _v2, m) {
    if (!_v1 || !_v2) return undefined;
    const v1 = _v1.map(v => typeof v === 'string' ? Number(v) : v);
    const v2 = _v2.map(v => typeof v === 'string' ? Number(v) : v);

    const d_h = Math.abs(v1[0] - v2[0]);
    const d_s = Math.abs(v1[1] - v2[1]);
    const d_l = Math.abs(v1[2] - v2[2]);
    
    return d_h < (0.166 * m) && d_s < (0.2 * m) && d_l < (0.2 * m);
  };

  function _mergeHSL(_v1, _v2) {
    return [ (_v1[0] + _v2[0])/2 , (_v1[1] + _v2[1])/2, (_v1[2] + _v2[2])/2 ]
  }


  // const colors = Object.keys(colorCollection);

  
  // const newColorCollection = [];
  
  // colors.forEach((_hsl, i) => {
  //   const sibling = [];
  //   const hsl = _hsl.split('_').map(_v => typeof _v === 'string' ? Number(_v) : _v);
  //   const isBright = hsl[2] > 0.85;
  //   const isDark = hsl[2] < 0.15;
    
  //   if (!isBright && !isDark) {
      
  //     const closeColor = newColorCollection.find(_c => _isSimularColor(hsl, _c.base, (1 / Math.sqrt(_c.group.length))));
  //     if (closeColor !== undefined) {
  //       const c_hsl = closeColor.base;
  //       closeColor.base = _mergeHSL(hsl, c_hsl);
  //       closeColor.group.push(hsl);
  //     }
  //     else {
  //       newColorCollection.push({
  //         base: hsl,
  //         group: [ hsl ],
  //       })
  //     }
      
  //     colors.push(hsl);


  //     for (let i = 0; i < newColorCollection.length; i++) {
  //       const closeColor = newColorCollection.find((_c, j) => {
  //         return i !== j && _isSimularColor(newColorCollection[i].base, _c.base, 0.7 / newColorCollection[i].group.length);
  //       });
  //       if (closeColor) {
  //         console.log('merge')
  //         closeColor.base = _mergeHSL(newColorCollection[i].base, closeColor.base);
  //         closeColor.group = [ ...closeColor.group, ...newColorCollection[i].group ].sort((a, b) => (a[1] + a[2]) - (b[1] + b[2]))
  //         newColorCollection.splice(i, 1);
  //       }
  //     }
      
  //   }
    
  // })

  // console.log(Object.keys(colorCollection).length)
  // console.log(newColorCollection)

  return {
    data: result,
    myColor
    // base64Content: canvas.toDataURL(),
    // colorCollection: newColorCollection.sort((a, b) => a.base[0] - b.base[0])
  };
}


const Pixelator = ({ src, scale }) => {

  const rootRef = useRef();
  const [ data, setData ] = useState();
  const [ colorData, setColorData ] = useState();
  const [ imgSize, setImgSize ] = useState();
  // if (data) {
  //   console.log(JSON.stringify(data.map(_item => _item.fill)))
  // }
  
  useEffect(() => {
    handleInitPixelator();
  }, [])

  function handlePreloadImage() {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.src = src;
      img.onload = function() {
        setImgSize([img.width, img.height]);
        resolve(img);
      }
    })

  }
  
  async function handleInitPixelator() {
    const image = await handlePreloadImage();
    const { data, myColor, base64Content, colorCollection } = pixelateImage(image, scale);
    // setBase64Data(base64Content);
    setData(data)
    setColorData(myColor)
    // setColorData(Object.values(colorCollection));
  }


  console.log(colorData)

  return (
    <div ref={rootRef} style={{ display: 'flex', padding: '20px' }}>
      <div>
        <img src={src} />
      </div>
      {/* { base64Data && <img src={base64Data} /> } */}
      <div>
        { (data && imgSize) &&
          <svg width={`${imgSize[0]}px`} height={`${imgSize[1]}px`} viewBox={`0 0 ${data.at(-1).x} ${data.at(-1).y}`} viewPort={`0 0 ${data.at(-1).x} ${data.at(-1).y}`}>
            { data.map((_item, i) =>
              <rect key={i} width={scale * 1} height={scale * 1} {..._item} />
            ) }
          </svg>
        }
        <br />
        { data && `${data.length} blocks.` }
      </div>
      <div>
        { (colorData) &&
          <svg width={`${imgSize[0]}px`} height={`${imgSize[1]}px`} viewBox={`0 0 ${data.at(-1).x} ${data.at(-1).y}`} viewPort={`0 0 ${data.at(-1).x} ${data.at(-1).y}`}>
            { colorData.map((_item, i) =>
              <React.Fragment key={i}>
                { _item.pixels.map((_pixel, j) =>
                  <rect key={j} x={_pixel.split('_')[0]*scale} y={_pixel.split('_')[1]*scale} width={scale * 1} height={scale * 1} fill={getCSSHsl(_item.colors[0])} />
                ) }
              </React.Fragment>
            ) }
          </svg>
        }
        <br />
        { colorData && `${colorData.length} blocks.` }
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {/* { colorData?.map((_color, i) =>
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '0 20px', marginBottom: '12px', width: '50%', boxSizing: 'border-box' }}>
            <div style={{ width: '8px', height: '8px', background: getCSSHsl(_color.base) }}></div>

            { _color.group.map((_color, j) =>
              <div key={j} style={{ width: '4px', height: '4px', background: getCSSHsl(_color) }}></div>
            ) }
          </div>
        )
      } */}
      </div>
    </div>
  )
}

export default Pixelator;