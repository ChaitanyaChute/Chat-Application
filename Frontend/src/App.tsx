import { BrowserRouter, Routes } from 'react-router'
import './App.css'
import { Route } from 'react-router'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {


  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={<Login />} />
        <Route path='/auth/s' element={<Signup />} />
        <Route path='/auth' element={<Login />} />


      </Routes>
    </BrowserRouter>
      
    </div>
  )
}

export default App
