import ChapterCard from '@/components/ChapterCard';
import { getMangaDetails } from '@/services/mangaServices';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

type Chapter = {
    title: string;
    url: string;
    date: string
};

type MangaData = {
    cover: string;
    title: string;
    summary: string;
    ratingValue: string;
    rankLine: string;
    chapters: Chapter[];
    lastUpdated: string
}

type Props = {}

const MangaDetail = (props: Props) => {
    const { slug } = useLocalSearchParams();
    const [loading, setLoading] = useState(true)
    const hasFetchedRef = useRef(false);
    const [data, setData] = useState<MangaData | null>(null)
    console.log("this is data", slug)

    const getData = async () => {
        try {
            const res = await getMangaDetails(slug[0]);
            setData(res);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (slug && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            getData();
        }
    }, [slug])

    if (loading) return <ActivityIndicator size="large" />;


    return (
        <ScrollView className=''>
            <View className='flex items-center'>
                <Image
                    source={{ uri: data?.cover.trim() }}
                    style={{
                        width: 200,
                        height: 250,
                        marginLeft: 0,
                        objectFit: "contain",
                        borderRadius: 20,
                        marginTop: 6
                    }}
                />
            </View>
            <View className='flex'>
                <Text className='dark:text-white text-xl font-bold text-center mt-4'>{data?.title}</Text>
                <View className='bg-slate-800 flex items-center font-semibold m-4 rounded-lg p-2 gap-2'>
                    <Text className='dark:text-white'>
                        Rating ⭐ : {data?.ratingValue}
                    </Text>
                    <Text className='dark:text-white'>
                        Rank: {data?.rankLine}
                    </Text>
                    <Text className='text-red-600 underline'>
                        Summary
                    </Text>
                    <Text className='dark:text-white'>
                        {data?.summary || "summary is not available for this"}
                    </Text>
                </View>
            </View>
            <View className='bg-slate-800 m-4 mt-0 rounded-lg p-2'>
                {data?.chapters?.map((item, index) => (
                    <ChapterCard
                        key={index}
                        name={item?.title}
                        url={item?.url}
                        date={item?.date}
                    />
                ))}
            </View>
        </ScrollView>
    )
}

export default MangaDetail