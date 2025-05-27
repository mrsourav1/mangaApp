import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Truncate from './Truncate';

interface MangaCardProps {
    Img: string;
    name: string;
    rating: string;
    chapter: string;
    ImgSlug: string;
    chapterUrl:string;
}

const MangaCard: React.FC<MangaCardProps> = ({ Img, name, rating, chapter, ImgSlug, chapterUrl}) => {
    
    const mangaPageHandler = (chapterUrl: string) => {
        const url = chapterUrl.split("/manga/")[1].replace(/\/$/, "");
        router.push(`/manga/${url}`);
      };

    return (
        <View className='flex bg-slate-200 dark:bg-slate-800 w-6/12 h-max p-4 rounded-lg m-2'>
            <View className='items-center h-fit w-full mb-3'>
            <TouchableOpacity onPress={() => router.push(`/mangaInfo/${ImgSlug}`)}>
                <Image
                    source={Img}
                    style={{ width: 180, height: 150 }}
                    contentFit="contain"
                    transition={500}
                    className=''
                />
            </TouchableOpacity>
            </View>
            <View className='flex items-start'>
                <Truncate
                    name={name}
                    limit={20}
                />
                <Text className='text-black dark:text-white'>⭐ :{rating}</Text>
                <View className='flex-row w-min'>
                    <Text 
                        onPress={() => mangaPageHandler(chapterUrl)}
                        className='bg-slate-600 rounded-xl p-1 text-sm text-black dark:text-white'>{chapter}</Text>
                    <Text
                        className='text-xs text-red-600 ml-1'
                    >
                        New!!!
                    </Text>
                </View>
                {/* <View className='flex-row mt-2 w-min'>
                    <Text 
                        className='bg-slate-600 rounded-xl p-1 text-sm text-black dark:text-white'
                        onPress={()=>console.log(chapterUrl)}
                    >
                        {`Chapter ${Number(chapter.replace(/\D/g, '')) - 1}`}
                    </Text>
                </View> */}
            </View>
        </View>
    )
}

export default MangaCard
