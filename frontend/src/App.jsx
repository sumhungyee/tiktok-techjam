import { useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'

import viteLogo from '/vite.svg'
import './App.css'

import FabricCanvas from './components/FabricJSViewport'
import { TabBar } from './components/Figma/TabBar/TabBar';
import ShopPage from './components/ShopPage'

function App() {
  const canvasHeight = window.innerHeight * 0.93;

  return (
    <>
      <ChakraProvider>
        <ShopPage
        canvasWidth={window.innerWidth}
        canvasHeight={canvasHeight}
        />
        {/* <FabricCanvas 
          canvasWidth={window.innerWidth}
          canvasHeight={canvasHeight}
        />
        */}
        <TabBar />
      </ChakraProvider>
    </>
  )
}

export default App
