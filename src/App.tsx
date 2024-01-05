import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Admin from './pages/admin';
import Consumer from './pages/consumer';

function App() {

  return (
    <>
       <BrowserRouter>
        <Routes>
			<Route path="/" element={<Navigate to="/admin" />}/>
			<Route path="/admin" element={<Admin />} />
			<Route path="/consumer" element={<Consumer />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
