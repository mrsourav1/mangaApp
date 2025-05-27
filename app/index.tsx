import MangaCard from '@/components/MangaCard';
import { getHomePage, searchManga } from '@/services/mangaServices';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import "../global.css";

interface Manga {
  cover: string;
  title: string;
  rating: string;
  latestChapter: string;
  imgSlug: string;
  chapterUrl: string;
}

type SearchData = {
  title: string;
  url: string;
  type: string;
};


export default function Index() {
  const [data, setData] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchData, setSearchData] = useState<SearchData[]>([]);

  const getData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await getHomePage(page);
      const newMangas = res?.mangas || [];
      setData(prev => [...prev, ...newMangas]);
      if (newMangas.length === 0) setHasMore(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    getData();
  }, [page]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchText.trim()) {
        searchManga(searchText).then((res) => {
          setSearchData(res?.data || []);
        });
      } else {
        setSearchData([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchText]);

  const mangaPageHandler = (chapterUrl: string) => {
    const url = chapterUrl.split('/manga/')[1].replace(/\/$/, '');
    console.log(url);
    router.push(`/mangaInfo/${url}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Manga Shit',
          headerRight: () => (
            <TouchableOpacity
              className='h-10 w-10 justify-center items-center'
              style={{ marginRight: 15 }}
              onPress={() => {
                setSearchVisible(prev => !prev);
                setSearchData([]);
                setSearchText("")
              }}
            >
              <Text><Ionicons name={searchVisible ? 'close' : 'search'} size={24} color="white" /></Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView style={{ padding: 16, flex: 1 }}>
          {searchVisible && (
            <View style={{ marginBottom: 10 }}>
              <TextInput
                placeholder="Search manga..."
                value={searchText}
                onChangeText={setSearchText}
                style={{
                  backgroundColor: '#f1f1f1',
                  padding: 10,
                  borderRadius: 8,
                }}
              />
              {searchText && searchData.length > 0 && (
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    elevation: 4,
                    maxHeight: 200,
                    marginTop: 4,
                  }}
                >
                  <FlatList
                    data={searchData}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => {
                          setSearchText('');
                          setSearchVisible(false);
                          setSearchData([]);
                          mangaPageHandler(item.url);
                        }}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                        }}
                      >
                        <Text style={{ color: '#000' }}>{item.title}</Text>
                      </Pressable>
                    )}
                  />
                </View>
              )}
            </View>
          )}

          {/* Manga List */}
          <FlatList
            data={data}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <MangaCard
                Img={item.cover}
                name={item.title}
                rating={item.rating}
                chapter={item.latestChapter}
                ImgSlug={item.imgSlug}
                chapterUrl={item.chapterUrl}
              />
            )}
            keyExtractor={(item, index) => `${index}`}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator size="large" color="#FF9900" /> : null}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}
