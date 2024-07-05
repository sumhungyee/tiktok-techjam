// TO DO: get image as the background, then add transparent buttons
import React, {useState } from 'react';
import {
    Button,
    Image,
    Box,
    Stack,
  } from '@chakra-ui/react';

import shopimage from '../assets/tiktokshop.jpeg'
import wardrobeButton from '../assets/wardrobe_button.png'


const ShopPage = (props) => {
    const [wardrobeButtonVisible, setWardrobeButtonVisible] = useState(true);
    const handleClick = () => {
        setWardrobeButtonVisible(false);
      };

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
        {wardrobeButtonVisible && (
            <Button
                position='absolute'
                bottom='50px'  
                left='50%'
                transform='translateX(-50%) scale(2.6)'
                bg='transparent'
                color='transparent'
                // bg='white' // for button to appear
                // color='black' // for button to appear
                size='md'
                onClick={handleClick} 
                >
                Click Me
            </Button>
        )}
        </Box>
    </Stack>  



    </>
    );
};

export default ShopPage;