import React, { useState, useEffect } from 'react';
import {
    Button,
    Image,
    Box,
    Stack,
  } from '@chakra-ui/react';

import shopimage from '../assets/tiktokshop.jpeg'


const ShopPage = (props) => {
    return (
        <>
            {/* Aditya, behold: css-in-html-in-js */}
            <style> 
                {`
                    @keyframes shadowColorChange {
                        0% { box-shadow: 0 0 0 4px #fd2c54; }
                        25% { box-shadow: 0 0 0 4px #fda234; }
                        50% { box-shadow: 0 0 0 4px #12bf4c; }
                        75% { box-shadow: 0 0 0 4px #4568dc; }
                        100% { box-shadow: 0 0 0 4px #fd2c54; }
                    }
                `}
            </style>
            <Stack 
                width={'100vw'}
                height={'93vh'}
                align={'center'}
            >
                <Image
                    src={shopimage}
                    width={'100vw'}
                    height={'100%'}
                    objectFit='cover'
                    objectPosition = 'top'
                />
                <Button
                    position='absolute'
                    top={'85vh'}
                    size={'lg'}
                    bg='#fd2c54'
                    color='white'
                    _focus={{ bg: '#fd2c54' }}
                    _active={{ bg: '#fd2c54' }}
                    _hover={{ bg: '#fd2c54' }}
                    sx={{
                        animation: 'shadowColorChange 3s infinite',
                    }}
                >
                    Go To Wardrobe!
                </Button>
            </Stack>  
        </>
    );
};

export default ShopPage;