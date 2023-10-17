import logo from './logo.svg';
import './App.css';
import Pixelator from './Pixelator';
import Playgroud from './Playgroud';
import Playgroud2 from './Playgroud2';


function App() {
  return (
    <div className="App">
      <Pixelator scale={10} src="/samples/8.png" />
      {/* <Playgroud /> */}
      {/* <Playgroud2 /> */}
    </div>
  );
}

export default App;
