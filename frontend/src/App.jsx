import React,{ useState } from 'react'
import './App.css'
import { Register } from './Register';
import { Login } from './Login';
function App() {
  const [curentFrom, setCurrentFrom] = useState('login');

  const toogleForm = (formName) => {
    setCurrentFrom(formName);
  }
  return (
    
      <div className="App">
        {
          curentFrom === 'login' ? <Login onFormSwitch={toogleForm} /> : <Register onFormSwitch={toogleForm} />
        }
      </div>
    
    
  )
}

export default App
