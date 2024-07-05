// TO DO: get image as the background, then add transparent buttons
import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Image,
    Box,
    Stack,
  } from '@chakra-ui/react';

import shopimage from '../assets/tiktokshop.jpeg'
import wardrobeButton from '../assets/wardrobe_button.png'


const ShopPage = (props) => {

    return (
    <>
    <Stack direction='row' position='relative'>
        <Box position='relative'>
            <Image
                boxSize='910px'
                src={shopimage} 
                alt='Shop home page'
            />

            <Image 
                src={wardrobeButton} 
                alt='Go to wardrobe button' 
                position='absolute'
                bottom='-20px'
                left='50%'
                transform='translateX(-50%) scale(0.9)'
            />  

            <Button
                position='absolute'
                bottom='50px'  
                left='50%'
                transform='translateX(-50%) scale(2.6)'
                bg='transparent'
                color='transparent'
                // color='black' // for button to appear
                size='md'
                >
                Click Me
            </Button>
        </Box>
    </Stack>  



    </>
    );
};

export default ShopPage;