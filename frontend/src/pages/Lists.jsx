import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import { ArrowUp } from "lucide-react";

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

const mockWardrobeData = [
  {
    title: "Item 1",
    tags: ["tag1", "tag2"],
    thumbnail:
      "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",
  },
  {
    title: "Item 2",
    tags: ["tag3", "tag4"],
    thumbnail:
      "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",
  },
  {
    title: "Item 3",
    tags: ["tag5", "tag6"],
    thumbnail:
      "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",
  },
  {
    title: "Item 1",
    tags: ["tag1", "tag2"],
    thumbnail:
      "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",
  },
  {
    title: "Item 2",
    tags: ["tag3", "tag4"],
    thumbnail:
      "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",
  },
  {
    title: "Item 3",
    tags: ["tag5", "tag6"],
    thumbnail:
      "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAGP0lEQVR4nOyd/VePaR7HffUlFFuRJUf7qK2lliXyVNl2ZVNnZcl62NUuW5zCCethpTpLWXlqH4TqbLWrxMo0Y0bSGE55GKZBjhhmkpiGpqEwYzRh5h94/TyfX96vH19Xpw6vc51zX/d9X9ftdFkzoRsxeXIT+nVFxegzX85EfzF+EPrCB73QZ7f8HH1OwBj08e0/Qz/V3xX9mmtl6JNbPkD/pzeq0C97xP8Plwf7o18c74a+O1rxraEAxiiAMQpgjAIYowDGKIAxDo+oFzhw7oe+6JPm30D/xzk/Qp9d9yX64wV8vX+5cAD6G0+Poy8pfYK+/nEz+j3ul9C7evC6J+GCN/qslIHo3+/D65LnycfQawYYowDGKIAxCmCMAhijAMYogDHOuoLZOBB9n6+jF41Yit7nLt/fvzSO76cff/hr9BuHO9Endp5E37G9Bf3KF5noE57xv2vHNV5nePfj5xnuKfw8YOmzQPSpHjvQawYYowDGKIAxCmCMAhijAMYogDHOyrQ5OHC9lq/3Ay/Uo7+yIQl9aEcU+rl1I9A31qej7xvRB31ZRl/06X280MfMuoV+lyuvSzrac9GnHqxFnzjpEfqQcfPQawYYowDGKIAxCmCMAhijAMYogDGOTU18fRpS/jr6jVf2o3dbshm958ffQ3/uFP/d2Jjz6E/XhKA/VlyBfnDjRvShjbHo3XJ5fXO1fST65wt4nXTnF7w/4ElhDnrNAGMUwBgFMEYBjFEAYxTAGAUwxtHQzM8D5vW8gD6pOh79Nu9+6EdO4evuE38NQl989i/oc2bydbRrUBZ6l9oz6F/VTUMfO30l+qeOAvT/zliOflnlePS5AefQawYYowDGKIAxCmCMAhijAMYogDGOvp4PceDTIr6+9o3k93n2DbmNvuZ5NfrpNQvRvzlxLfojd9rRRwbx+T9RvF2hm48/P2+4tLoI/eJa3g8c+9YM9GXO36BP/f899JoBxiiAMQpgjAIYowDGKIAxCmCMc1eJg0d68YX0+S4+52d1Bd+v71wcjX5oM//dKbn8vk3VKj7XqLk3n8c5aTyfd+SVMxl9+s4j6FNvxqA/tPVz9Htis9EfreNzTzUDjFEAYxTAGAUwRgGMUQBjFMAYR35VOQ6MKm1Dn9j+Cv1Nvzj0TSX8+w/7/Qr973/7P/QrEoLRp/5jAfq0Vl5P7DrwCfrOltHor/2B9z3ktXmgHxLB+xjOTuCf1wwwRgGMUQBjFMAYBTBGAYxRAGMcw8L4nJzD5Wnom1Luoj8Zyud61v3tB+i/M8YT/cIWfr++4J8H0N/14nOKPIbyuZ6He65D7+1Zgn5uGu9z3rH8l+jd0h6gD7rN6w/NAGMUwBgFMEYBjFEAYxTAGAUwxnlmfisOVLTxezWO1qvoMwJ5n0HJWhf0lWOK0Mek8Hs4513q0C96bQj7ylL0BzP5PNHksZ+h//NW/j1vb+HvFf/9GJ+nNGz4JvSaAcYogDEKYIwCGKMAxiiAMQpgjLMxfC8O+H3N99lXl3eg7xwcjn5f63T0pWHX0Yf48j7khivJ6IP37kTv58brj92R/0Iffor3M09t+5B/vvLH6DPG8b6Hd4NT0WsGGKMAxiiAMQpgjAIYowDGKIAxzsv5/J2AbmHfR+3yn23oZ8bx978W5bO/NzcfvX8X7z8YcCIB/dp4fh9/+6su9B9NGot+kzufdzQxgJ8feFTkoY89wd81cw+dhV4zwBgFMEYBjFEAYxTAGAUwRgGMcbT4T8WB/YH8na/93cPQR/Xm9UFEI58jlL6E78vfXsjf8/piDn+f6/RPw9FnbYlE/98aPu8or/cG9Ldu8fOP0YN43VD9k/fQR5TxvmvNAGMUwBgFMEYBjFEAYxTAGAUwxpm1/nc44LO+B3r3aQ3oGx7PRh/Xn9/zaXzyDvobNXyOUH0tr0vWZPN1uu9u3k8QF83fDzia0IS+eMZ30feYkIL+aia/75R6ZxR6zQBjFMAYBTBGAYxRAGMUwBgFMMbZI9gHB5rmr0Df5fIS/eYAvo8fkMvvySR6rUKfteEr9EmnhqMf68rPM4Z687mh/Q9NRD8wmb8nvDK6EH1i9UX0W6Kq0Ofdb0avGWCMAhijAMYogDEKYIwCGKMAxnwTAAD//zAvdUVKhdhBAAAAAElFTkSuQmCC",
  },
  {
    title: "Item 1",
    tags: ["tag1", "tag2"],
    thumbnail:
      "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",
  },
  {
    title: "Item 2",
    tags: ["tag3", "tag4"],
    thumbnail:
      "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",
  },
  {
    title: "Item 3",
    tags: ["tag5", "tag6"],
    thumbnail:
      "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",
  },
  {
    title: "Item 1",
    tags: ["tag1", "tag2"],
    thumbnail:
      "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",
  },
  {
    title: "Item 2",
    tags: ["tag3", "tag4"],
    thumbnail:
      "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAGP0lEQVR4nOyd/VePaR7HffUlFFuRJUf7qK2lliXyVNl2ZVNnZcl62NUuW5zCCethpTpLWXlqH4TqbLWrxMo0Y0bSGE55GKZBjhhmkpiGpqEwYzRh5h94/TyfX96vH19Xpw6vc51zX/d9X9ftdFkzoRsxeXIT+nVFxegzX85EfzF+EPrCB73QZ7f8HH1OwBj08e0/Qz/V3xX9mmtl6JNbPkD/pzeq0C97xP8Plwf7o18c74a+O1rxraEAxiiAMQpgjAIYowDGKIAxDo+oFzhw7oe+6JPm30D/xzk/Qp9d9yX64wV8vX+5cAD6G0+Poy8pfYK+/nEz+j3ul9C7evC6J+GCN/qslIHo3+/D65LnycfQawYYowDGKIAxCmCMAhijAMYogDHOuoLZOBB9n6+jF41Yit7nLt/fvzSO76cff/hr9BuHO9Endp5E37G9Bf3KF5noE57xv2vHNV5nePfj5xnuKfw8YOmzQPSpHjvQawYYowDGKIAxCmCMAhijAMYogDHOyrQ5OHC9lq/3Ay/Uo7+yIQl9aEcU+rl1I9A31qej7xvRB31ZRl/06X280MfMuoV+lyuvSzrac9GnHqxFnzjpEfqQcfPQawYYowDGKIAxCmCMAhijAMYogDGOTU18fRpS/jr6jVf2o3dbshm958ffQ3/uFP/d2Jjz6E/XhKA/VlyBfnDjRvShjbHo3XJ5fXO1fST65wt4nXTnF7w/4ElhDnrNAGMUwBgFMEYBjFEAYxTAGAUwxtHQzM8D5vW8gD6pOh79Nu9+6EdO4evuE38NQl989i/oc2bydbRrUBZ6l9oz6F/VTUMfO30l+qeOAvT/zliOflnlePS5AefQawYYowDGKIAxCmCMAhijAMYogDGOvp4PceDTIr6+9o3k93n2DbmNvuZ5NfrpNQvRvzlxLfojd9rRRwbx+T9RvF2hm48/P2+4tLoI/eJa3g8c+9YM9GXO36BP/f899JoBxiiAMQpgjAIYowDGKIAxCmCMc1eJg0d68YX0+S4+52d1Bd+v71wcjX5oM//dKbn8vk3VKj7XqLk3n8c5aTyfd+SVMxl9+s4j6FNvxqA/tPVz9Htis9EfreNzTzUDjFEAYxTAGAUwRgGMUQBjFMAYR35VOQ6MKm1Dn9j+Cv1Nvzj0TSX8+w/7/Qr973/7P/QrEoLRp/5jAfq0Vl5P7DrwCfrOltHor/2B9z3ktXmgHxLB+xjOTuCf1wwwRgGMUQBjFMAYBTBGAYxRAGMcw8L4nJzD5Wnom1Luoj8Zyud61v3tB+i/M8YT/cIWfr++4J8H0N/14nOKPIbyuZ6He65D7+1Zgn5uGu9z3rH8l+jd0h6gD7rN6w/NAGMUwBgFMEYBjFEAYxTAGAUwxnlmfisOVLTxezWO1qvoMwJ5n0HJWhf0lWOK0Mek8Hs4513q0C96bQj7ylL0BzP5PNHksZ+h//NW/j1vb+HvFf/9GJ+nNGz4JvSaAcYogDEKYIwCGKMAxiiAMQpgjLMxfC8O+H3N99lXl3eg7xwcjn5f63T0pWHX0Yf48j7khivJ6IP37kTv58brj92R/0Iffor3M09t+5B/vvLH6DPG8b6Hd4NT0WsGGKMAxiiAMQpgjAIYowDGKIAxzsv5/J2AbmHfR+3yn23oZ8bx978W5bO/NzcfvX8X7z8YcCIB/dp4fh9/+6su9B9NGot+kzufdzQxgJ8feFTkoY89wd81cw+dhV4zwBgFMEYBjFEAYxTAGAUwRgGMcbT4T8WB/YH8na/93cPQR/Xm9UFEI58jlL6E78vfXsjf8/piDn+f6/RPw9FnbYlE/98aPu8or/cG9Ldu8fOP0YN43VD9k/fQR5TxvmvNAGMUwBgFMEYBjFEAYxTAGAUwxpm1/nc44LO+B3r3aQ3oGx7PRh/Xn9/zaXzyDvobNXyOUH0tr0vWZPN1uu9u3k8QF83fDzia0IS+eMZ30feYkIL+aia/75R6ZxR6zQBjFMAYBTBGAYxRAGMUwBgFMMbZI9gHB5rmr0Df5fIS/eYAvo8fkMvvySR6rUKfteEr9EmnhqMf68rPM4Z687mh/Q9NRD8wmb8nvDK6EH1i9UX0W6Kq0Ofdb0avGWCMAhijAMYogDEKYIwCGKMAxnwTAAD//zAvdUVKhdhBAAAAAElFTkSuQmCC",
  },
  {
    title: "Item 3",
    tags: ["tag5", "tag6"],
    thumbnail:
      "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",
  },
];

const mockWishlistData = [
  {
    title: "Item A",
    tags: ["tagA", "tagB"],
    thumbnail:
      "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",
  },
  {
    title: "Item B",
    tags: ["tagC", "tagD"],
    thumbnail:
      "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",
  },
  {
    title: "Item C",
    tags: ["tagE", "tagF"],
    thumbnail:
      "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",
  },
];

function Lists() {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    setWardrobeItems(mockWardrobeData);
    setWishlistItems(mockWishlistData);
  }, []);

  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <ChakraProvider theme={theme}>
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
                    key={index}
                    title={item.title}
                    tags={item.tags}
                    thumbnail={item.thumbnail}
                  />
                ))}
              </Box>
            </TabPanel>
            <TabPanel>
              <Box overflowY="auto">
                {wishlistItems.map((item, index) => (
                  <ItemCard
                    key={index}
                    title={item.title}
                    tags={item.tags}
                    thumbnail={item.thumbnail}
                  />
                ))}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <div
        className={`transition-all duration-500 opacity-0 ${
          scrollPosition > 100 ? "opacity-100" : ""
        }`}
      >
        <ScrollToTopButton />
      </div>
    </ChakraProvider>
  );
}

function ItemCard({ title, tags, thumbnail }) {
  return (
    <Box
      bg="#f9f9f9"
      p={4}
      borderRadius="8px"
      mb={4}
      border="1px solid #e2e2e2"
      shadow="sm"
      onClick={() => {console.log("route to canvas")}}
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

function ScrollToTopButton() {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      onClick={handleClick}
      position="fixed"
      bottom="4"
      right="4"
      colorScheme=""
      variant="solid"
      textColor="black"
      outline="0.5px solid black"
      shadow="md"
      rounded="full"
      p="1px"
      bg="white"
    >
      <ArrowUp />
    </Button>
  );
}

export default Lists;
