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
  IconButton,
  Flex,
  Input,
  Alert,
  AlertIcon,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { useNavigate } from "react-router";
import { ChevronLeft, Trash2, LucideCamera, Plus, X, CheckCircle2 } from "lucide-react";

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
  onDrawerClose,
  setLoading,
}) => {
  const {
    isOpen: isImageUploadOpen,
    onOpen: onImageUploadOpen,
    onClose: onImageUploadClose,
  } = useDisclosure();
  const fileInputRef = useRef(null);
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const [fileToUpload, setFileToUpload] = useState(null);

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

        <DrawerContent
          padding={0}
          margin={0}
          className="p-0 m-0"
          paddingTop={5}
        >
          <Flex justifyContent="space-between" paddingLeft={5} paddingRight={5}>
            <Button
              variant="ghost"
              leftIcon={<LucideCamera/>}
              onClick={onImageUploadOpen}
            >
              <Text marginLeft={2}
              >Upload to Wardrobe</Text>
            </Button>

      <AlertDialog
        isOpen={isImageUploadOpen}
        onClose={onImageUploadClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Upload Your Clothes 
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text> Add a new item to your wardrobe by uploading an image of a piece of clothing.  </Text>

              <Alert 
                status='warning'
                marginTop={3}
              >
                <AlertIcon />
                Please upload a clear image in front of a plain background!
              </Alert>

            <Flex
              align={'center'}
            >
              <Text 
                as='b' 
                flex={1}
              >
                  Step 1:
              </Text>
              <Input
                type="text"
                placeholder="Enter item name (optional)"
                marginTop={3}
                flex={3}
              />
            </Flex>

            <Flex
              align={'center'}
            >
              <Text 
                as='b' 
                flex={1}
              >
                  Step 2:
              </Text>
              <Button
                leftIcon={ fileToUpload==null ? <LucideCamera/> : <CheckCircle2/> }
                marginTop={3}
                flex={3}
                onClick={handleFileInputClick}
                colorScheme={ fileToUpload==null ? 'gray' : 'green'}
              >
                { fileToUpload == null ? `Take a Photo` : 'Photo Found!'}
              </Button>
            </Flex>
            <Input
              ref={fileInputRef}
              type="file"
              multiple={false}
              accept="image/*"
              hidden
              onChange={(e) => {
                setFileToUpload(e.target.files[0]);
              }}
            />

            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onImageUploadClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={() => {
                  onImageUploadClose();
                }}
                ml={3}
              >
                Upload
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

            <IconButton
              aria-label="Close Drawer"
              icon={<X />}
              onClick={onClose}
              variant="ghost"
            />
          </Flex>

          <DrawerBody padding={0} mt="2rem">
            <Lists 
              handleItemCardClick={handleItemCardClick} 
              onDrawerClose={onDrawerClose}
              setLoading={setLoading}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const FabricCanvas = (props) => {
  const navigate = useNavigate();

  const [canvas, setCanvas] = useState();
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <div>
      <canvas id="canvas" />

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
        onDrawerClose={onDrawerClose}
        setLoading={setLoading}
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

      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        alignContent={"center"}
        justifyContent={"center"}
        display={loading ? "" : "none"}
      >
        <Spinner 
          size="xl"
        />
        <Text> Preparing Your Clothes! </Text>
      </Box>

    </div>
  );
};

export default FabricCanvas;
