import { useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'

import viteLogo from '/vite.svg'
import './App.css'

import FabricCanvas from './components/FabricJSViewport'
import { TabBar } from './components/Figma/TabBar/TabBar';

function App() {
  const canvasHeight = window.innerHeight * 0.93;

  return (
    <>
      <ChakraProvider>
        <FabricCanvas 
          canvasWidth={window.innerWidth}
          canvasHeight={canvasHeight}
        />
        <TabBar />
      </ChakraProvider>
    </>
  )
}

export default App
