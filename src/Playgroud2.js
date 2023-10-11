import logo from './logo.svg';
import './App.css';
import Pixelator from './Pixelator';
import { useMemo, useState } from 'react';

function getCSSHsl(hsla) {
  return `hsla(${hsla[0]*360}, ${hsla[1]*100}%, ${hsla[2]*100}%, ${hsla[3]})`;
}

function hslaToRgb(_hsla) {
  const hsla = getCSSHsl(_hsla);
  const [h, s, l, a] = hsla
      .match(/(\d+(\.\d+)?)/g)
      .map((value, index) => (index === 0 ? value / 360 : value / 100));
  // const [h, s, l, a] = hsla
  //     .match(/(\d+(\.\d+)?)/g)
  //     .map((value, index) => (index === 0 ? value / 360 : value / 100));

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = h * 6;
  const x = chroma * (1 - Math.abs((hPrime % 2) - 1));

  let r, g, b;

  if (hPrime >= 0 && hPrime < 1) {
      r = chroma;
      g = x;
      b = 0;
  } else if (hPrime >= 1 && hPrime < 2) {
      r = x;
      g = chroma;
      b = 0;
  } else if (hPrime >= 2 && hPrime < 3) {
      r = 0;
      g = chroma;
      b = x;
  } else if (hPrime >= 3 && hPrime < 4) {
      r = 0;
      g = x;
      b = chroma;
  } else if (hPrime >= 4 && hPrime < 5) {
      r = x;
      g = 0;
      b = chroma;
  } else {
      r = chroma;
      g = 0;
      b = x;
  }

  const m = l - chroma / 2;
  r += m;
  g += m;
  b += m;

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
}


function colorDistance(c1, c2) {
  const [r1, g1, b1] = c1.slice(0, 3);
  const [r2, g2, b2] = c2.slice(0, 3);

  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;

  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function groupSimilarColors(colors, threshold) {
  const groups = [];

  for (const color of colors) {
      let foundGroup = false;

      for (const group of groups) {
          if (colorDistance(color, group[0]) <= threshold) {
              group.push(color);
              foundGroup = true;
              break;
          }
      }

      if (!foundGroup) {
          groups.push([color]);
      }
  }

  return groups;
}


function generateRandomHsl() {
  return [ Math.random(), Math.random(), Math.random(), 100 ];
}

const Playgroud2 = () => {
  const [ colors, setColors ] = useState([]);
  const [ colorCollection, setColorCollection ] = useState([]);


  const handleAddColor = (_colors) => {
    const similarityThreshold = 75;
    const rgbColors = _colors.map(hslaToRgb);
    const colorGroups = groupSimilarColors(rgbColors, similarityThreshold);
    console.log(colorGroups)
    setColorCollection(colorGroups)
  }
  
  const handleClickButton = () => {
    const result = [];
    for (let i = 0; i < 300; i++) {
      const newColor = generateRandomHsl();
      result.push(newColor);
    }
    handleAddColor(result);
  };
  
  return (
    <div className="App">
      <button onClick={handleClickButton}>Click</button>
      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
        { colors.map((_color, i) =>
          <div key={i} style={{ width: '10px', height: '10px', background: getCSSHsl(_color) }}></div>
        ) }
      </div> */}
      <hr />
      <div>
      { colorCollection?.map((_child, i) =>
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
            {/* <div style={{ width: '20px', height: '20px', background: getCSSHsl(_child.base) }}></div> */}
            { _child.map((_color, j) =>
              <div key={j} style={{ width: '10px', height: '10px', background: `rgba(${_color.join(',')})` }}></div>
            ) }
          </div>
        )
      }
      </div>
    </div>
  );
}

export default Playgroud2;
