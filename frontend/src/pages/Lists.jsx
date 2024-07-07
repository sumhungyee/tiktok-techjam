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
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialog,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import { ArrowUp, HandPlatter } from "lucide-react";
import {
  getShopItemImage,
  getUserItemImage,
  getUserWardrobe,
  getUserWishlist,
  HARD_CODED_USER_ID
} from "../utils/requests.js";
import { SearchIcon } from "lucide-react";

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

const sortItemByDescendingId = (item, other) => other.id - item.id;

function Lists({ handleItemCardClick, onDrawerClose, setLoading, updateWardrobe }) {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

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
  }, [updateWardrobe]);

  function isSearchResult(title, tags, query) {
    query = query.toLowerCase();
    title ??= "";
    return (
      query === "" ||
      tags.filter((tag) => tag.toLowerCase().includes(query)).length > 0 ||
      title.toLowerCase().includes(query)
    );
  }

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
              Your selected item is still being processed. Please try again
              later.
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
            <Tab _active={{ bg: "gray.50" }}> My Wardrobe</Tab>
            <Tab _active={{ bg: "gray.50" }}> My Wishlist</Tab>
          </TabList>
          <TabIndicator mt="-10px" height="2px" bg="black" borderRadius="1px" />
          <TabPanels>
            <TabPanel>
              <Box h="full" overflowY="auto">
                <InputGroup mx="auto" width={"98%"} mb={"16px"}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon className="text-gray-300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search"
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                    }}
                    focusBorderColor="gray.500"
                  />
                </InputGroup>
                {wardrobeItems
                  .filter((item) => isSearchResult(item.description, item.tags, searchQuery))
                  .sort(sortItemByDescendingId)
                  .map((item, index) => (
                    <ItemCard
                      key={item.id}
                      title={item.description}
                      tags={item.tags}
                      thumbnail={item.thumbnail}
                      onClick={async () => {
                        setLoading(true);
                        onDrawerClose();
                        const imgBlob = await getUserItemImage(
                          HARD_CODED_USER_ID,
                          item.id,
                          onErrorDialogOpen
                        );
                        if (imgBlob)
                          handleItemCardClick(URL.createObjectURL(imgBlob));
                        setLoading(false);
                      }}
                    />
                  ))}
              </Box>
            </TabPanel>
            <TabPanel>
              <Box overflowY="auto">
                <InputGroup mx="auto" width={"98%"} mb={"16px"}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon className="text-gray-300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search"
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                    }}
                    focusBorderColor="gray.500"
                  />
                </InputGroup>
                {wishlistItems
                  .filter((item) => isSearchResult(item.description, item.tags, searchQuery))
                  .sort(sortItemByDescendingId)
                  .map((item, index) => (
                    <ItemCard
                      key={item.id}
                      title={item.description}
                      tags={item.tags}
                      thumbnail={item.thumbnail}
                      onClick={async () => {
                        setLoading(true);
                        onDrawerClose();
                        const imgBlob = await getShopItemImage(
                          item.shop_id,
                          item.id,
                          onErrorDialogOpen
                        );
                        if (imgBlob)
                          handleItemCardClick(URL.createObjectURL(imgBlob));
                        setLoading(false);
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
      bg="white"
      p={4}
      borderRadius="8px"
      mb={4}
      border="1px solid #e2e2e2"
      shadow="sm"
      onClick={onClick}
      _active={{ bg: "gray.100" }}
    >
      <Box display="flex" alignItems="start" justifyContent="start">
        <div className="size-28 min-h-28 min-w-28">
          <img
            src={`data:image/png;base64,${thumbnail}`}
            alt={title}
            className="max-h-full max-w-full rounded-md mx-auto"
          />
        </div>
        <Box ml="10px">
          <Box fontWeight="500" className="text-left line-clamp-2 w-11/12">
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
