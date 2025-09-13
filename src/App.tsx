// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResumeBuilder from "./components/ResumeBuilder";
import HomePage from "./components/HomePage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder" element={<ResumeBuilder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;