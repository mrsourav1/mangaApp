import { getChapter } from '@/services/mangaServices';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image as RNImage // Native image for measuring dimensions
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function ChapterReader() {
  const { slug } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // Store list of images with dimensions
  const [imageData, setImageData] = useState<
    { uri: string; height: number }[]
  >([]);

  useEffect(() => {
    const fetchChapter = async () => {
      const path = Array.isArray(slug) ? slug.join('/') : slug;
      try {
        const urls = await getChapter(`${process.env.EXPO_PUBLIC_MANGA_URL}/manga/${path}`);

        // Get size of each image and calculate scaled height
        // const imageDataPromises = urls.map((url: string) => {
        //   return new Promise<{ uri: string; height: number }>((resolve) => {
        //     RNImage.getSize(
        //       url.trim(),
        //       (width, height) => {
        //         const scaledHeight = (screenWidth * height) / width;
        //         resolve({ uri: url.trim(), height: scaledHeight });
        //       },
        //       () => {
        //         // Fallback in case getSize fails
        //         resolve({ uri: url.trim(), height: 600 }); // or some default
        //       }
        //     );
        //   });
        // });

        // const finalImageData = await Promise.all(imageDataPromises);
        // setImageData(finalImageData);

        setImageData([]);

        // Load images sequentially
        for (const url of urls) {
          const processedImage = await new Promise<{ uri: string; height: number }>((resolve) => {
            RNImage.getSize(
              url.trim(),
              (width, height) => {
                const scaledHeight = (screenWidth * height) / width;
                resolve({ uri: url.trim(), height: scaledHeight });
              },
              () => resolve({ uri: url.trim(), height: 600 })
            );
          });
          console.log("This is processedImage",processedImage)
          // Add each image to state one by one
          setImageData(prev => [...prev, processedImage]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (slug && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchChapter();
    }
  }, [slug]);

  if (loading) return <ActivityIndicator className='h-full flex justify-center items-center' style={{ flex: 1 }} size="large" />;

  return (
    <FlatList
      data={imageData}
      keyExtractor={(_, index) => `${index}`}
      renderItem={({ item }) => (
        <ExpoImage
          source={{ uri: item.uri }}
          style={{
            width: screenWidth,
            height: item.height,
          }}
          contentFit="contain"
        />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

