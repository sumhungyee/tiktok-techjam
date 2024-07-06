import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
  Button,
  useDisclosure,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter, AlertDialog,
} from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import { ArrowUp, HandPlatter } from "lucide-react";
import {
  getShopItemImage,
  getUserItemImage,
  getUserWardrobe,
  getUserWishlist
} from "../utils/requests.js";

const HARD_CODED_USER_ID = 1;

const theme = extendTheme({
  fonts: {
    heading: "Montserrat, sans-serif",
    body: "Montserrat, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "#ffffff",
        color: "#213547",
      },
    },
  },
});

function Lists({handleItemCardClick}) {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const {
    isOpen: isErrorDialogOpen,
    onOpen: onErrorDialogOpen,
    onClose: onErrorDialogClose,
  } = useDisclosure();
  const okRef = React.useRef();

  useEffect(() => {
    getUserWardrobe(HARD_CODED_USER_ID).then((data) => {
      setWardrobeItems(data);
    });
    getUserWishlist(HARD_CODED_USER_ID).then((data) => {
      setWishlistItems(data);
    });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <AlertDialog
          isOpen={isErrorDialogOpen}
          leastDestructiveRef={okRef}
          onClose={onErrorDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Item processing
            </AlertDialogHeader>

            <AlertDialogBody>
              Your selected item is still being processed. Please try again later.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onErrorDialogClose} ref={okRef}>
                Ok
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Box
        minHeight="100vh"
        height="100vh"
        bg="#ffffff"
        color="#213547"
        className="w-screen"
        position="static"
      >
        <Tabs variant="unstyled" isFitted m={0}>
          <TabList mb="0.5rem" shadow="md" pt="0.5rem" pb="0.25rem">
            <Tab _active={{ bg: "gray.50" }}>Wardrobe</Tab>
            <Tab _active={{ bg: "gray.50" }}>Wishlist</Tab>
          </TabList>
          <TabIndicator mt="-10px" height="2px" bg="black" borderRadius="1px" />
          <TabPanels>
            <TabPanel>
              <Box h="full" overflowY="auto">
                {wardrobeItems.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    title={item.title}
                    tags={item.tags}
                    thumbnail={item.thumbnail}
                    onClick={async () => {
                      const imgBlob = await getUserItemImage(
                          HARD_CODED_USER_ID,
                          item.id,
                          onErrorDialogOpen
                      )
                      if (imgBlob)
                        handleItemCardClick(URL.createObjectURL(imgBlob))
                    }}
                  />
                ))}
              </Box>
            </TabPanel>
            <TabPanel>
              <Box overflowY="auto">
                {wishlistItems.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    title={item.title}
                    tags={item.tags}
                    thumbnail={item.thumbnail}
                    onClick={async () => {
                      const imgBlob = await getShopItemImage(
                          item.shop_id,
                          item.id,
                          onErrorDialogOpen
                      )
                      if (imgBlob)
                        handleItemCardClick(URL.createObjectURL(imgBlob))
                    }}
                  />
                ))}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </ChakraProvider>
  );
}

function ItemCard({ title, tags, thumbnail, onClick }) {
  return (
    <Box
      bg="#f9f9f9"
      p={4}
      borderRadius="8px"
      mb={4}
      border="1px solid #e2e2e2"
      shadow="sm"
      onClick={onClick}
      _active={{ bg: "gray.100" }}
    >
      <Box display="flex" alignItems="start" justifyContent="start">
        <img
          src={`data:image/png;base64,${thumbnail}`}
          alt={title}
          className="size-28 rounded-md mr-3"
        />
        <Box ml="2px">
          <Box fontWeight="500" className="text-left">
            {title}
          </Box>
          <Box fontSize="sm" color="gray.500">
            <Box fontSize="sm" color="gray.500" display="flex" flexWrap="wrap">
              {tags.map((tag) => (
                <Box
                  key={tag}
                  bg="gray.200"
                  color="gray.600"
                  borderRadius="md"
                  px={2}
                  py={1}
                  mr={2}
                  mb={2}
                >
                  {tag}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Lists;
