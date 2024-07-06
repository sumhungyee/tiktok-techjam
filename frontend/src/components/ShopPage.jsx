import {
    Button,
    Image,
    Stack,
    IconButton
  } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import shopimage from '../assets/tiktokshop.jpeg'
import { ChevronLeft } from 'lucide-react';


const ShopPage = (props) => {
    const navigate = useNavigate();

    return (
        <>
            {/* Aditya, behold: css-in-html-in-js */}
            {/* I must not let you cook: 🧯💨💨💨 🔥 ➡️ ❄️ */}
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
                <IconButton
                    icon={<ChevronLeft className='size-8'/>}
                    onClick={() => { navigate(-1) }}
                    position="absolute"
                    backgroundColor="white"
                    left="5px"
                    top="14px"
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
                        animation: 'shadowColorChange 2s infinite',
                    }}
                    onClick={() => { navigate('/fabric-canvas') }}
                >
                    Go To Wardrobe!
                </Button>
            </Stack>  
        </>
    );
};

export default ShopPage;