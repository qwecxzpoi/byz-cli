import { useState } from 'react'
import logo from './logo.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <i className="i-carbon-user-avatar w-20 h-20 display-block text-red" />
      <img src={logo} alt="logo" className="w-20 h-20 bg-red"/>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}

export default App
