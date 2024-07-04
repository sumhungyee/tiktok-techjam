import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Box,
  Text,
} from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

// Will be served via API later
import item1 from '../assets/Pleated Skirt mimi momo.png';
import item2 from '../assets/SHEIN EZwear Cartoon & Slogan Graphic Crop Tee.png';
import item3 from "../assets/SHEIN EZwear Women's Drawstring Side Asymmetrical Hem Summer Tube Top.png";
import item4 from "../assets/SHEIN MOD Ladies' Fashionable Asymmetrical Strap Ruffle Top, Light Yellow, Ideal For Summer Vacation.png";
import item5 from "../assets/SHEIN MOD Women's Floral Print Shirred Wide Strap Tank Top.png";

const FabricCanvas = (props) => {
    const [canvas, setCanvas] = useState();

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    useEffect(() => {
        const c = new fabric.Canvas("canvas", {
          height: props.canvasHeight - 180,
          width: props.canvasWidth,
          backgroundColor: "white",
        });

        setCanvas(c);
        return () => {
          c.dispose();
        };
      }, []);

    const addItem = (canvas, item) => {
        fabric.Image.fromURL(item, (img) => {
            img.set({
              left: 70,
              top: 250,
              angle: 0,
              padding: 0,
              cornersize: 10,
              hasRotatingPoint: true,

                scaleX: 0.28,
                scaleY: 0.28,

            });
            canvas.add(img);
          });
    };

    const deleteSelected = (canvas) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
        }
    }

    const deleteAll = (canvas) => {
        canvas.clear();
    }

    // TODO: Replace with Aditya's menu, which sould return an item to add
    const items = [item1, item2, item3, item4, item5];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const temp = () => {
      // TODO: Replace with Aditya's menu, which sould return an item to add
      addItem(canvas, randomItem);
    }

    return (
    <div>
      <canvas id="canvas" />

      <button 
        style={{
          position: "absolute",
          top: "60px",
          left: "20px",
          fontSize: "18px",
          alignItems: "center",
        }}
        onClick={() => temp()}
      >
        <b style={{fontSize: "25px", margin: 20}}>+</b> Add Clothes
      </button>

      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "320px",
          alignItems: "center",
          justifyContent: "left",
        }}
      >
        <button 
          style={{ fontSize: "25px", marginRight: 20}}
          onClick={() => onOpen()}
        > ↻ </button>

        <button 
          style={{ fontSize: "21px", }}
          onClick={() => deleteSelected(canvas)}
        > 🗑 </button>
      </div>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Clear Canvas?
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure?  You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={() => {onClose(); deleteAll(canvas);}} ml={3}>
                Clear
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>


      <Box
        width={props.canvasWidth}
        height="15vh"
        padding={5}
        marginBottom={10}
      >
        <Text 
          textAlign={"left"}
          fontWeight={"bold"}
          color={"gray.600"}
          marginBottom={2}
        > Suggested </Text>
        <Swiper
          slidesPerView={3}
          spaceBetween={30}
          freeMode={true}
          pagination={{
            clickable: true,
          }}
          modules={[FreeMode]}
          className="suggestionSwiper"
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <img 
                src={item} 
                alt="item" 
                style={{ width: "100%", height: "100%" }} 
                onClick={() => addItem(canvas, item)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>





    </div>
    );
};

export default FabricCanvas;