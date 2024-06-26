import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import LeftNav from "../components/LeftNav";
import LikedVideoCard from "../components/card/LikedVideoCard";
import { searchVideosAPI } from "../services/videoService";
import { Context } from "../context/contextApi";
import { getLikedVideosAPI } from "../services/likeVideoService";

const LikedVideo = () => {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { changeLoading } = useContext(Context);

  useEffect(() => {
    document.getElementById("root").classList.add("custom-h");
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    changeLoading(true);

    try {
      const data = await getLikedVideosAPI();
      if (data?.code === 0) {
        setData(data?.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log(error);
      setData([]);
    }

    changeLoading(false);
    setLoading(false);
  };

  useEffect(() => {
    document.getElementById("root").classList.remove("custom-h");
  }, []);

  return (
    <div className="flex flex-row h-[calc(100%-56px)] ">
      <LeftNav />
      <div className="grow w-[calc(100%-240px)] h-full overflow-y-auto bg-pink-50 custom-scrollbar">
        <div className="text-black px-5 py-3 font-bold text-4xl flex justify-center items-center">
          Video đã thích
        </div>
        <div className="grid grid-cols-1 gap-2 p-5">
          {data?.map((item) => {
            return <LikedVideoCard key={item?.id?.videoId} data={item} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default LikedVideo;
