import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ThreeExample from './ThreeExample'
import { ThreeGame } from './three/ThreeGame'

function App() {

  useEffect(() => {

  }, [])
  return (
    <div id="app">
      <ThreeExample />
    </div>
  )
}

export default App
