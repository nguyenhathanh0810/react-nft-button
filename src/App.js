import './App.css';
import Minter from './components/Minter';

function App() {
  return (
    <div className="App">
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 480, boxShadow: '#e5e5e5 2px 8px 20px', borderRadius: 8 }}>
          <Minter />
        </div>
      </div>
    </div>
  );
}

export default App;
