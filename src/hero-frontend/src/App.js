import React from 'react';
import { HeroTable } from './heroTable.js';
import './App.css'

function App() {
  document.title = "hero.gg";
  return (
    <div className="App">
      <HeroTable />
    </div>
  );
}

export default App;
