import logo from './logo.svg';
import './App.css';
import Pixelator from './Pixelator';
import Playgroud from './Playgroud';
import Playgroud2 from './Playgroud2';


function App() {
  return (
    <div className="App">
      <Pixelator scale={3} src="/samples/7.png" />
      {/* <Playgroud /> */}
      {/* <Playgroud2 /> */}
    </div>
  );
}

export default App;
