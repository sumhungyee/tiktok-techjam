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

import {
    getItemImage, getSuggestions,
    HARD_CODED_USER_ID,
    uploadItem
} from "../utils/requests.js";

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

  const [uploadItemName, setUploadItemName] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [updateWardrobeFlag, setUpdateWardrobeFlag] = useState(0)

  const resetUploadForm = () => {
    setUploadItemName('');
    fileInputRef.current.value = '';
    setFileToUpload(null);
  }

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
                onChange={(e) => {
                    setUploadItemName(e.target.value);
                }}
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
              <Button onClick={() => {
                  resetUploadForm();
                  onImageUploadClose();
              }}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                isDisabled={fileToUpload == null}
                onClick={() => {
                  uploadItem(HARD_CODED_USER_ID, uploadItemName, fileToUpload).then(() => {
                      setUpdateWardrobeFlag(updateWardrobeFlag + 1)
                  });
                  resetUploadForm();
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
              updateWardrobe={updateWardrobeFlag}
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
  const [canvasObjectCount, setCanvasObjectCount] = useState(0);
  const [lastAddedItemInfo, setLastAddedItemInfo] = useState({});
  const [suggestionItems, setSuggestionItems] = useState([]);

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

    useEffect(() => {
      if (canvasObjectCount !== 1 || lastAddedItemInfo.id === undefined) {
        return
      }
      getSuggestions(
          HARD_CODED_USER_ID,
          lastAddedItemInfo.id,
          lastAddedItemInfo.listName
      ).then((data) => {
        setSuggestionItems(data);
      });
    }, [canvasObjectCount, lastAddedItemInfo])

  const addItem = (canvas, imageUrl, itemId, itemList) => {
    fabric.Image.fromURL(imageUrl, (img) => {
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
      setLastAddedItemInfo({ id: itemId, listName: itemList })
      setCanvasObjectCount(canvas.getObjects().length);
    });
  };

  const deleteSelected = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      setLastAddedItemInfo({})
      setCanvasObjectCount(canvas.getObjects().length);
    }
  };

  const deleteAll = (canvas) => {
    canvas.clear();
  };

  const handleItemCardClick = (itemImageLink, itemId, listName) => {
    addItem(canvas, itemImageLink, itemId, listName);
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
          {suggestionItems.map((item, index) => (
            <SwiperSlide
                key={index}
                className="size-28 min-h-28 min-w-28"
            >
              <img
                src={`data:image/jpeg;base64,${item.thumbnail}`}
                alt="item"
                onClick={async () => {
                  const imgBlob = await getItemImage(item.id, () => {});
                  if (imgBlob) {
                    addItem(canvas, URL.createObjectURL(imgBlob));
                  }
                }}
                className="max-h-full max-w-full rounded-md mx-auto"
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
