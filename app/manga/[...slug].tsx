// import { getChapter } from '@/services/mangaServices';
// import { Image as ExpoImage } from 'expo-image';
// import { useLocalSearchParams } from 'expo-router';
// import { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Dimensions,
//   FlatList,
//   Image as RNImage // Native image for measuring dimensions
// } from 'react-native';

// const screenWidth = Dimensions.get('window').width;

// export default function ChapterReader() {
//   const { slug } = useLocalSearchParams();
//   const [loading, setLoading] = useState(true);
//   const hasFetchedRef = useRef(false);

//   // Store list of images with dimensions
//   const [imageData, setImageData] = useState<
//     { uri: string; height: number }[]
//   >([]);

//   useEffect(() => {
//     const fetchChapter = async () => {
//       const path = Array.isArray(slug) ? slug.join('/') : slug;
//       try {
//         const urls = await getChapter(`${process.env.EXPO_PUBLIC_MANGA_URL}/manga/${path}`);

//         // Get size of each image and calculate scaled height
//         // const imageDataPromises = urls.map((url: string) => {
//         //   return new Promise<{ uri: string; height: number }>((resolve) => {
//         //     RNImage.getSize(
//         //       url.trim(),
//         //       (width, height) => {
//         //         const scaledHeight = (screenWidth * height) / width;
//         //         resolve({ uri: url.trim(), height: scaledHeight });
//         //       },
//         //       () => {
//         //         // Fallback in case getSize fails
//         //         resolve({ uri: url.trim(), height: 600 }); // or some default
//         //       }
//         //     );
//         //   });
//         // });

//         // const finalImageData = await Promise.all(imageDataPromises);
//         // setImageData(finalImageData);

//         setImageData([]);

//         // Load images sequentially
//         for (const url of urls) {
//           const processedImage = await new Promise<{ uri: string; height: number }>((resolve) => {
//             RNImage.getSize(
//               url.trim(),
//               (width, height) => {
//                 const scaledHeight = (screenWidth * height) / width;
//                 resolve({ uri: url.trim(), height: scaledHeight });
//               },
//               () => resolve({ uri: url.trim(), height: 600 })
//             );
//           });
//           console.log("This is processedImage",processedImage)
//           // Add each image to state one by one
//           setImageData(prev => [...prev, processedImage]);
//         }
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (slug && !hasFetchedRef.current) {
//       hasFetchedRef.current = true;
//       fetchChapter();
//     }
//   }, [slug]);

//   if (loading) return <ActivityIndicator className='h-full flex justify-center items-center' style={{ flex: 1 }} size="large" />;

//   return (
//     <FlatList
//       data={imageData}
//       keyExtractor={(_, index) => `${index}`}
//       renderItem={({ item }) => (
//         <ExpoImage
//           source={{ uri: item.uri }}
//           style={{
//             width: screenWidth,
//             height: item.height,
//           }}
//           contentFit="contain"
//         />
//       )}
//       contentContainerStyle={{ paddingBottom: 20 }}
//     />
//   );
// }


import { getChapter } from '@/services/mangaServices';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image as RNImage,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function ChapterReader() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageData, setImageData] = useState<{ uri: string; height: number }[]>([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const hasFetchedRef = useRef(false);
  const debounceRef = useRef(false);
  const { slug } = useLocalSearchParams();

  const CHUNK_SIZE = nextIndex < 3 ? 2 : 3; // smaller chunk initially, larger later

  const getScaled = (url: string) =>
    new Promise<{ uri: string; height: number }>((resolve) => {
      RNImage.getSize(
        url.trim(),
        (w, h) => resolve({ uri: url.trim(), height: (screenWidth * h) / w }),
        () => resolve({ uri: url.trim(), height: 600 }) // fallback height
      );
    });

  useEffect(() => {
    const fetchUrlList = async () => {
      const path = Array.isArray(slug) ? slug.join('/') : slug;
      try {
        const urls = await getChapter(
          `${process.env.EXPO_PUBLIC_MANGA_URL}/manga/${path}`
        );
        setImageUrls(urls.map((u: string) => u.trim()));
      } finally {
        setLoading(false);
      }
    };

    if (slug && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUrlList();
    }
  }, [slug]);

  useEffect(() => {
    if (nextIndex >= imageUrls.length) return;

    const loadChunk = async () => {
      setIsFetchingMore(true);
      const chunk = imageUrls.slice(nextIndex, nextIndex + CHUNK_SIZE);
      const processed = await Promise.all(chunk.map(getScaled));

      // Prefetch upcoming 2 images (optional)
      imageUrls.slice(nextIndex + CHUNK_SIZE, nextIndex + CHUNK_SIZE + 2).forEach(uri => {
        RNImage.prefetch?.(uri.trim());
      });

      setImageData((prev) => [...prev, ...processed]);
      setNextIndex((i) => i + CHUNK_SIZE);
      setIsFetchingMore(false);
    };

    loadChunk();
  }, [nextIndex, imageUrls]);

  const handleEndReached = () => {
    if (debounceRef.current || nextIndex >= imageUrls.length) return;
    debounceRef.current = true;

    setTimeout(() => {
      setNextIndex((i) => i); // triggers useEffect
      debounceRef.current = false;
    }, 300); // debounce for 300ms
  };

  if (loading || imageData.length === 0) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        size="large"
      />
    );
  }

  return (
    <FlatList
      data={imageData}
      keyExtractor={(_, idx) => String(idx)}
      renderItem={({ item }) => (
        <ExpoImage
          source={{ uri: item.uri }}
          style={{ width: screenWidth, height: item.height }}
          contentFit="contain"
        />
      )}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      initialNumToRender={2}
      windowSize={7}
      removeClippedSubviews
      contentContainerStyle={{ paddingBottom: 40 }}
      ListFooterComponent={
        isFetchingMore ? (
          <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
        ) : null
      }
    />
  );
}
