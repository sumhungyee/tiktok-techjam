import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
  Text,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Flex,
  Input,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { useNavigate } from "react-router";
import { ChevronLeft, Trash2, LucideCamera, Plus, X } from "lucide-react";

import Lists from "../pages/Lists";

// Will be served via API later
import item1 from "../assets/Pleated Skirt mimi momo.png";
import item2 from "../assets/SHEIN EZwear Cartoon & Slogan Graphic Crop Tee.png";
import item3 from "../assets/SHEIN EZwear Women's Drawstring Side Asymmetrical Hem Summer Tube Top.png";
import item4 from "../assets/SHEIN MOD Ladies' Fashionable Asymmetrical Strap Ruffle Top, Light Yellow, Ideal For Summer Vacation.png";
import item5 from "../assets/SHEIN MOD Women's Floral Print Shirred Wide Strap Tank Top.png";

const ListsDrawer = ({
  isOpen,
  onOpen,
  onClose,
  drawerTriggerBtnRef,
  handleItemCardClick,
}) => {
  const fileInputRef = useRef(null);
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
        finalFocusRef={drawerTriggerBtnRef}
        width="screen"
        margin={0}
        padding={0}
        className="p-0 m-0"
      >
        <DrawerOverlay />

        <DrawerContent padding={0} margin={0} className="p-0 m-0" paddingTop={5}>

          <Flex justifyContent="space-between" paddingLeft={5} paddingRight={5}>
            <Button
              variant="ghost"
              leftIcon={<LucideCamera />}
              onClick={handleFileInputClick}
              >
                <Text marginLeft={2}
                >Add to Wardrobe</Text>
              </Button>

            <Input 
              ref={fileInputRef}
              type="file" 
              multiple={false}
              accept="image/*"
              hidden
              onChange={(e) => console.log(e.target.files)}
            />

            <IconButton
              aria-label="Close Drawer"
              icon={<X />}
              onClick={onClose}
              variant="ghost"
            />
          </Flex>

          <DrawerBody padding={0} mt="2rem">
            <Lists handleItemCardClick={handleItemCardClick} />
          </DrawerBody>

        </DrawerContent>


      </Drawer>
    </>
  );
};

const FabricCanvas = (props) => {
  const navigate = useNavigate();

  const [canvas, setCanvas] = useState();

  const {
    isOpen: isAlertDialogOpen,
    onOpen: onAlertDialogOpen,
    onClose: onAlertDialogClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const drawerTriggerBtnRef = React.useRef();

  useEffect(() => {
    const c = new fabric.Canvas("canvas", {
      height: props.canvasHeight - 175,
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
  };

  const deleteAll = (canvas) => {
    canvas.clear();
  };

  // TODO: Replace with Aditya's menu, which sould return an item to add
  const items = [item1, item2, item3, item4, item5];
  const randomItem = items[Math.floor(Math.random() * items.length)];
  const handleItemCardClick = (itemImageLink) => {
    addItem(canvas, itemImageLink);
    isDrawerOpen(false);
  };

  return (
    <div>
      <canvas id="canvas" />

      {/* <button
        style={{
          position: "absolute",
          top: "35px",
          left: "35px",
          fontSize: "18px",
          alignItems: "center",
          display: "flex",
          gap: "10px",
        }}
        onClick={() => navigate(-1)}
        ref={drawerTriggerBtnRef}
      >
        <ChevronLeft className="mr-3"/>
        {"Back to shop"}
      </button> */}

      <button
        style={{
          position: "absolute",
          top: "50px",
          left: "20px",
          fontSize: "18px",
          alignItems: "left",
        }}
        onClick={() => navigate(-1)}
        ref={drawerTriggerBtnRef}
      >
        <b style={{ fontSize: "30px", margin: 22 }}> ‹ </b> Go Back
      </button>

      <button
        style={{
          position: "absolute",
          top: "100px",
          left: "20px",
          fontSize: "18px",
          alignItems: "left",
        }}
        onClick={onDrawerOpen}
        ref={drawerTriggerBtnRef}
      >
        <b style={{ fontSize: "25px", margin: 20 }}>+</b> Add Clothes
      </button>

      <ListsDrawer
        isOpen={isDrawerOpen}
        onOpen={onDrawerOpen}
        onClose={onDrawerClose}
        drawerTriggerBtnRef={drawerTriggerBtnRef}
        handleItemCardClick={handleItemCardClick}
      />

      <div
        style={{
          position: "absolute",
          top: "55px",
          left: "320px",
          alignItems: "center",
          justifyContent: "left",
        }}
      >
        <button
          style={{ fontSize: "25px", marginRight: 20 }}
          onClick={() => onAlertDialogOpen()}
        >
          {" "}
          ↻{" "}
        </button>

        <button
          style={{ fontSize: "21px" }}
          onClick={() => deleteSelected(canvas)}
        >
          {" "}
          🗑{" "}
        </button>
      </div>

      <AlertDialog
        isOpen={isAlertDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Canvas?
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertDialogClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  onAlertDialogClose();
                  deleteAll(canvas);
                }}
                ml={3}
              >
                Clear
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Box
        width={props.canvasWidth}
        height="15vh"
        paddingLeft={5}
        paddingRight={5}
        paddingBottom={5}
        paddingTop={1}
        marginBottom={10}
      >
        <Text
          textAlign={"left"}
          fontWeight={"bold"}
          color={"gray.600"}
          marginBottom={2}
        >
          {" "}
          Suggested{" "}
        </Text>
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
