import axios from "axios";

export const getHomePage = async(page:number)=>{
    let params={page}
    const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/manga`,{
        params: { page },
    });
    return res.data;
}

export const getChapter = async(url:string)=>{
    const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/manga/chapter`,{
        url:url
    })
    return res.data;
}

export const getMangaDetails = async(slug:string)=>{
    const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/manga/${slug}`)
    return res.data;
}

export const searchManga = async(data:string)=>{
    const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/manga/search`,{
        title:data
    })
    return res.data
}