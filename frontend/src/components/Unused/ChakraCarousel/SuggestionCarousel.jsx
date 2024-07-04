import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import { capsFirst } from "./utils";
import theme from "./theme";

import {
    ChakraProvider,
    extendTheme,
    Container,
    Heading,
    Button,
    VStack,
    HStack,
    Text,
    Flex,
    Tag
  } from "@chakra-ui/react";
  
  import ChakraCarousel from "./ChakraCarousel.jsx";
  
  export const SuggestionCarousel = () => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      fetch("https://jsonplaceholder.typicode.com/posts/")
        .then((res) => res.json())
        .then((res) => setData(res));
    }, []);
  
    return (
          <ChakraCarousel gap={32}>
            {data.slice(5, 15).map((post, index) => (
              <Flex
                key={index}
                boxShadow="rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px"
                justifyContent="space-between"
                flexDirection="column"
                overflow="hidden"
                color="gray.300"
                bg="base.d100"
                rounded={5}
                flex={1}
                p={5}
              >

                <Text w="full">{capsFirst(post.body)}</Text>

              </Flex>
            ))}
          </ChakraCarousel>
    );
  }