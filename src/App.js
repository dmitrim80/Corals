import React from 'react';
import './App.css';
import CoralMain from './Corals/CoralMain';
import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom';
import './Corals/corals_page.css'

function App() {
  return (
  
    <BrowserRouter>
    <div className="App">
    <Routes> 
        <Route path="/" element={<Navigate replace to="/corals/index" />} />
        <Route path="/corals/*" element={<CoralMain />} />
    </Routes>
    </div>
    
    </BrowserRouter>

    
    
  );
}

export default App;