import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
    name:string,
    date:string,
    url:string
}

const ChapterCard = ({name,date,url}: Props) => {
    const mangaPageHandler = (chapterUrl: string) => {
            // return;
            const url = chapterUrl.split("/manga/")[1].replace(/\/$/, "");
            router.push(`/manga/${url}`);
          };
    return (
        <View className='m-1 bg-slate-700 flex-row justify-between'>
            <View>
                <Text onPress={() => mangaPageHandler(url)} className='dark:text-white p-4 underline font-bold'>{name}</Text>
            </View>
            <View className='flex flex-col justify-end mr-1'>
                <Text className='dark:text-white text-xs mb-1'>Updated at: {date}</Text>
            </View>
        </View>
    )
}

export default ChapterCard