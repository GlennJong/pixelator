import logo from './logo.svg';
import './App.css';
import Pixelator from './Pixelator';
import { useMemo, useState } from 'react';

function generateRandomHsl() {
  return [ Math.random(), Math.random(), Math.random() ];
}

function getCSSHsl(hsl) {
  return `hsl(${hsl[0]*360}, ${hsl[1]*100}%, ${hsl[2]*100}%)`;
}


function _isSimularColor(_v1, _v2, m) {
  const v1 = _v1.map(v => typeof v === 'string' ? Number(v) : v);
  const v2 = _v2.map(v => typeof v === 'string' ? Number(v) : v);

  const d_h = Math.abs(v1[0] - v2[0]);
  const d_s = Math.abs(v1[1] - v2[1]);
  const d_l = Math.abs(v1[2] - v2[2]);
  
  return d_h < (0.083 * m) && d_s < (0.5 * m) && d_l < (0.5 * m);
};

function _mergeHSL(_v1, _v2) {
  return [ (_v1[0] + _v2[0])/2 , (_v1[1] + _v2[1])/2, (_v1[2] + _v2[2])/2 ]
}


function Playgroud() {

  const [ colors, setColors ] = useState([]);
  const [ colorCollection, setColorCollection ] = useState([
    { base: [0 * 0.083, .5, .5], group: [] },
    { base: [1 * 0.083, .5, .5], group: [] },
    { base: [2 * 0.083, .5, .5], group: [] },
    { base: [3 * 0.083, .5, .5], group: [] },
    { base: [4 * 0.083, .5, .5], group: [] },
    { base: [5 * 0.083, .5, .5], group: [] },
    { base: [6 * 0.083, .5, .5], group: [] },
    { base: [7 * 0.083, .5, .5], group: [] },
    { base: [8 * 0.083, .5, .5], group: [] },
    { base: [9 * 0.083, .5, .5], group: [] },
    { base: [10 * 0.083, .5, .5], group: [] },
    { base: [11 * 0.083, .5, .5], group: [] },
    { base: [12 * 0.083, .5, .5], group: [] },
  ]);


  const handleAddColor = (newColor) => {
    const isBright = newColor[2] > 0.85;
    const isDark = newColor[2] < 0.15;

    if (isBright || isDark) return;
    
    const closeColor = colorCollection.find(_c => _isSimularColor(newColor, _c.base, 1 / Math.max(1, _c.group.length)));
    if (closeColor !== undefined) {
      const c_hsl = closeColor.base;
      closeColor.base = _mergeHSL(newColor, c_hsl);
      closeColor.group.push(newColor);
    }
    else {
      colorCollection.push({
        base: newColor,
        group: [ newColor ],
      })
    }
    
    colors.push(newColor);
    setColors([...colors])
  
    for (let i = 0; i < colorCollection.length; i++) {
      const closeColor = colorCollection.find((_c, j) => {
        return i !== j && _isSimularColor(colorCollection[i].base, _c.base, 0.7 / Math.max(1, colorCollection[i].group.length));
      });
      if (closeColor) {
        console.log('merge')
        closeColor.base = _mergeHSL(colorCollection[i].base, closeColor.base);
        closeColor.group = [ ...closeColor.group, ...colorCollection[i].group ].sort((a, b) => (a[1] + a[2]) - (b[1] + b[2]))
        colorCollection.splice(i, 1);
      }
    }

    const sortColorCollection = colorCollection.sort((a, b) => a.base[0] - b.base[0]);
    
    setColorCollection(sortColorCollection)
  }
  
  const handleClickButton = () => {
    for (let i = 0; i < 300; i++) {
      const newColor = generateRandomHsl();
      handleAddColor(newColor);
    }
  };
  
  return (
    <div className="App">
      <button onClick={handleClickButton}>Click</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
        { colors.map((_color, i) =>
          <div key={i} style={{ width: '10px', height: '10px', background: getCSSHsl(_color) }}></div>
        ) }
      </div>
      <hr />
      <div>
      { colorCollection?.map((_child, i) =>
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
            <div style={{ width: '20px', height: '20px', background: getCSSHsl(_child.base) }}></div>
            { _child.group.map((_color, j) =>
              <div key={j} style={{ width: '10px', height: '10px', background: getCSSHsl(_color) }}></div>
            ) }
          </div>
        )
      }
      </div>
    </div>
  );
}

export default Playgroud;
