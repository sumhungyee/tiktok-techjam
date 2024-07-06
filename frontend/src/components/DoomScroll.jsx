import React, { useEffect, useRef } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

import video3 from '../assets/tiktoks/a1.mp4';
import video2 from '../assets/tiktoks/a2.mp4';
import video1 from '../assets/tiktoks/a3.mp4';
import video4 from '../assets/tiktoks/a4.mp4';
import video5 from '../assets/tiktoks/a5.mp4';
import video6 from '../assets/tiktoks/a6.mp4';

const DoomScrollPage = () => {
    const videoRefs = useRef([
        React.createRef(), 
        React.createRef(), 
        React.createRef(), 
        React.createRef(), 
        React.createRef(), 
        React.createRef()
    ]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play();
                } else {
                    entry.target.pause();
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, options);

        videoRefs.current.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            videoRefs.current.forEach(ref => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, []);

    return (
        <>
        {/* Aditya, behold: css-in-html-in-js */}
        <style> 
            {`
                @keyframes shadowColorChange {
                    0% { box-shadow: 0 0 12px 4px rgba(255, 0, 0, 0.5); } /* red */
                    20% { box-shadow: 0 0 12px 4px rgba(255, 165, 0, 0.5); } /* orange */
                    40% { box-shadow: 0 0 12px 4px rgba(0, 255, 0, 0.5); } /* green */
                    60% { box-shadow: 0 0 12px 4px rgba(0, 0, 255, 0.5); } /* blue */
                    80% { box-shadow: 0 0 12px 4px rgba(128, 0, 128, 0.5); } /* purple */
                    100% { box-shadow: 0 0 12px 4px rgba(255, 0, 0, 0.5); } /* Back to red */
                }
            `}
        </style>
        <Box
            w="100%"
            h="100vh"
            overflowY="scroll"
            css={{
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'y mandatory'
            }}
            bg={'black'}
        >
            {[video1, video2, video3, video4, video5, video6].map((src, index) => (
                <Box 
                    key={index} 
                    css={{ scrollSnapAlign: 'start' }} 
                    h="100vh" 
                    display="flex" 
                    flexDirection="column" 
                    justifyContent="center"
                    position={'relative'}
                >
                    <video
                        ref={videoRefs.current[index]}
                        src={src}
                        loop
                        muted
                        width="100%"
                        style={{ maxHeight: '100%', objectFit: 'cover' }}
                    />
                    {index === 2 && ( // Change to whatever index the shop ad is on
                        <Button
                            position="absolute"
                            top="83%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            size={'lg'}
                            bg='#fd2c54'
                            color='white'
                            _focus={{ bg: '#fd2c54' }}
                            _active={{ bg: '#fd2c54' }}
                            _hover={{ bg: '#fd2c54' }}
                            sx={{
                                animation: 'shadowColorChange 2s infinite',
                            }}
                            >
                            Go To Wardrobe!
                        </Button>
                    )}
                </Box>
            ))}
        </Box>
        </>
    );
};

export default DoomScrollPage;
