import { useState } from 'react'
import { Box, ChakraProvider, Text } from '@chakra-ui/react'

import viteLogo from '/vite.svg'
import './App.css'

import FabricCanvas from './components/FabricJSViewport'
import { TabBar } from './components/Figma/TabBar/TabBar';
import ShopPage from './components/ShopPage'
import DoomScrollPage from './components/DoomScroll'
import Lists from './pages/Lists'

function App() {
  const canvasHeight = window.innerHeight * 0.93;

  return (
    <>
      <ChakraProvider>

        <DoomScrollPage/>

        {/* <FabricCanvas 
          canvasWidth={window.innerWidth}
          canvasHeight={canvasHeight}
        />
        */}

        <Box
          position="fixed"
          bottom={0}
          left={0}
        >
          <TabBar />
        </Box>

      </ChakraProvider>
    </>
  )
}

export default App
