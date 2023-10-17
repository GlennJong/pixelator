import React, { useEffect, useRef, useState } from 'react';

function hex_to_hsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min){
      h = s = 0; // achromatic
  } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
  }

  h = Math.round(h*360);
  s = Math.round(s*100);
  l = Math.round(l*100);

  return [ h/360, s/100, l/100, 1 ];
}
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
function rgba_to_hsla(_r, _g, _b, _a) {
  const r = _r / 255;
  const g = _g / 255;
  const b = _b / 255;
  const a = _a / 255;

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

  function _fixedNum(num) {
    return Math.floor(num * 100) / 100;
  }

  return [_fixedNum(h), _fixedNum(s), _fixedNum(l), _fixedNum(a)];
}

function getCSSHsla(hsla) {
  return `hsla(${Math.floor(hsla[0]*360)}, ${Math.floor(hsla[1]*100)}%, ${Math.floor(hsla[2]*100)}%, ${hsla[3]})`;
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
        const hsla = rgba_to_hsla(
          originalImageData[pixelIndexPosition],
          originalImageData[pixelIndexPosition+1],
          originalImageData[pixelIndexPosition+2],
          originalImageData[pixelIndexPosition+3],
        );

        minHValue = Math.min(hsla[0], minHValue);
        maxHValue = Math.max(hsla[0], maxHValue);

        if (!(hsla.join('_') in colorCollection)) {
          colorCollection[hsla.join('_')] = [ [ newX, newY ] ]
        }
        else {
          colorCollection[hsla.join('_')].push([ newX, newY ]);
        }
        
        const color = 'rgba(' +
          originalImageData[pixelIndexPosition] + ',' + // r
          originalImageData[pixelIndexPosition + 1] + ',' + // g
          originalImageData[pixelIndexPosition + 2] + ',' + // b
          originalImageData[pixelIndexPosition + 3] / 255 //a
        + ')';

        // const colorHsla = `hsl(${Math.floor(hsl[0]*360)}, ${Math.floor(hsl[1]*100)}%, ${Math.floor(hsl[2]*100)}%)`
        const colorHsla = `hsla(${Math.floor(hsla[0]*360)}, ${Math.floor(hsla[1]*100)}%, ${Math.floor(hsla[2]*100)}%, ${hsla[3]})`;

        context.fillStyle = color;

        result.push({
          x: newX * pixelationFactor,
          y: newY * pixelationFactor,
          fill: colorHsla,
          // temp: simularColor,
        })

        pixelInfomation[`${newX}_${newY}`] = {
          pos: `${newX}_${newY}`,
          color: hsla,
        };
        
        context.fillRect(x, y, pixelationFactor, pixelationFactor);
      }
    }
  }

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
          const isSimularColor = _isSimularColor(pixelInfomation[`${x}_${y}`].color, _sibling.color, 1);
          return isSimularColor ? _sibling : undefined;
        }
      })
      pixelInfomation[`${x}_${y}`].siblings = pixelInfomation[`${x}_${y}`].siblings.filter(_sibling => !!_sibling);
    }
  }

  // console.log(pixelInfomation);

  const myColor = [];
  for (let x = 1; x <= totalWidthQty; x++) {
    for (let y = 1; y <= totalHeightQty; y++) {
      const self = pixelInfomation[`${x}_${y}`];
      const currentColorItem = myColor?.find(_color => _color.pixels.includes(`${x}_${y}`));
      if (currentColorItem) {
        // currentColorItem.colors = [...currentColorItem.colors, ...self.siblings.map(_sibling => _sibling.color.join('_'))]
        // currentColorItem.pixels = [...currentColorItem.pixels, ...self.siblings.map(_sibling => _sibling.pos)]

        currentColorItem.colors = [ ...new Set([...currentColorItem.colors, ...self.siblings.map(_sibling => _sibling.color.join('_'))]) ]
        currentColorItem.pixels = [ ...new Set([...currentColorItem.pixels, ...self.siblings.map(_sibling => _sibling.pos)]) ]

      }
      else {
        myColor.push({
          colors: [ self.color.join('_'), ...self.siblings.map(_sibling => _sibling.color.join('_')) ],
          pixels: [ self.pos, ...self.siblings.map(_sibling => _sibling.pos) ]
        })
      }
    }
  }

  myColor.forEach(_item => {
    _item.colors = [ ...new Set(_item.colors) ]
    _item.selected = _item.colors[0]
    _item.pixels = [ ...new Set(_item.pixels) ]
  })
  

  function _isSimularColor(_v1, _v2, m) {
    if (!_v1 || !_v2) return undefined;
    const v1 = _v1.map(v => typeof v === 'string' ? Number(v) : v);
    const v2 = _v2.map(v => typeof v === 'string' ? Number(v) : v);

    const d_h = Math.abs(v1[0] - v2[0]);
    const d_s = Math.abs(v1[1] - v2[1]);
    const d_l = Math.abs(v1[2] - v2[2]);
    
    return d_h < (0.166 * m) && d_s < (0.2 * m) && d_l < (0.2 * m);
  };

  // function _mergeHSL(_v1, _v2) {
  //   return [ (_v1[0] + _v2[0])/2 , (_v1[1] + _v2[1])/2, (_v1[2] + _v2[2])/2 ]
  // }



  return {
    data: result,
    myColor
  };
}


const Pixelator = ({ src, scale }) => {

  const rootRef = useRef();
  const colorPickerRef = useRef();
  const colorDataRef = useRef();
  const [ data, setData ] = useState();
  const [ colorData, setColorData ] = useState();
  const [ imgSize, setImgSize ] = useState();
  
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
    const { data, myColor } = pixelateImage(image, scale);
    
    setData(data)
    setColorData(myColor)
  }

  console.log(colorData)

  function handleClickColor(index) {
    // const colorPicker = document.createElement('input');
    // colorPicker.type = 'color';
    colorDataRef.current = {
      index: index,
      data: colorData,
    }
    colorPickerRef.current.click();
  }

  function handleChangeColor(e) {
    const { index, data } = colorDataRef.current;
    data[index].selected = hex_to_hsl(e.target.value).join('_');
    // console.log(e.target.value);
    setColorData([...colorDataRef.current.data])

  }

  function handleFinishChangeColor() {
    // console.log('end')
    // setColorData([...colorDataRef.current.data])
  }



  return (
    <>
      <input type="color" ref={colorPickerRef} onChange={handleChangeColor} onBlur={handleFinishChangeColor} />
      <div ref={rootRef} style={{ display: 'flex', padding: '20px', background: '#666' }}>
        <div>
          <img src={src} />
        </div>
        {/* { base64Data && <img src={base64Data} /> } */}
        <div>
          { (data && imgSize) &&
            <svg width={`${imgSize[0]}px`} height={`${imgSize[1]}px`} viewBox={`0 0 ${data.at(-1).x} ${data.at(-1).y}`} viewPort={`0 0 ${data.at(-1).x} ${data.at(-1).y}`}>
              { data.map((_item, i) =>
                <rect key={i} width={scale * 1} height={scale * 1} x={_item.x} y={_item.y} fill={_item.fill} />
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
                    <rect key={j} x={(_pixel.split('_')[0]-1)*scale} y={(_pixel.split('_')[1]-1)*scale} width={scale * 1} height={scale * 1} fill={getCSSHsla(_item.selected.split('_'))} />
                  ) }
                </React.Fragment>
              ) }
            </svg>
          }
          <br />
          { colorData && `${colorData.length} blocks.` }
        </div>
      </div>
      <div>
        { colorData && colorData.map((_item, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'center'}}>
          <div onClick={() => handleClickColor(i)} style={{ background: getCSSHsla(_item.selected.split('_')), width: '30px', height: '30px' }}></div>
          <div style={{ display: 'flex', padding: '20px'}}>
            { _item.colors.map((_color, j) =>
              <div key={j} style={{ border: '1px solid', background: getCSSHsla(_color.split('_')), width: '20px', height: '20px' }}></div>
            ) }
          </div>
        </div>
        ) }
      </div>
    </>
  )
}

export default Pixelator;