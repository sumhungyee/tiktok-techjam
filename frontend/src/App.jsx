import { useState } from 'react'
import { Box, ChakraProvider, Text } from '@chakra-ui/react'
import "./App.css";

import FabricCanvas from "./components/FabricJSViewport";
import { TabBar } from "./components/Figma/TabBar/TabBar";
import ShopPage from "./components/ShopPage";
import DoomScrollPage from "./components/DoomScroll";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  const canvasHeight = window.innerHeight * 0.93;

  return (
    <>
      <ChakraProvider>
        {/*  */}
        <Router>
          <Routes>
            <Route
              exact
              path="/"
              element={
                <DoomScrollPage />
              }
            />
            <Route
              path="/fabric-canvas"
              element={
                <>
                  <FabricCanvas
                    canvasWidth={window.innerWidth}
                    canvasHeight={canvasHeight}
                  />
                  <TabBar />
                </>
              }
            />
          </Routes>
        </Router>
      </ChakraProvider>
    </>
  );
}

export default App;
