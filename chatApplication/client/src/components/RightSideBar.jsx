import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

function RightSideBar() {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);


//get all the images from the messages and set them to state
  useEffect(() => {
    if (selectedUser && messages) {
      const images = messages
        .filter(
          (msg) =>
            (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id) &&
            msg.image
        )
        .map((msg) => msg.image);
      setMsgImages(images);
    }
  }, [messages, selectedUser]);

  if (!selectedUser) {
    return (
       <div className="flex-1 bg-[#10b981]/10 text-white flex items-center justify-center w-full h-full hidden">
      <p className="text-gray-400 text-center">Select a user to start chat</p>
    </div>
    );
  }

  return (
    <div className="bg-[#10b981]/10 text-white w-full relative overflow-y-scroll">
      {/* --- Profile Section --- */}
      <div className="pt-10 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-20 aspect-[1/1] rounded-full object-cover"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {onlineUsers?.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-600"></span>
          )}
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto text-center text-gray-300">
          {selectedUser.bio}
        </p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      {/* --- Media Section --- */}
      <div className="px-5 text-xs">
        <p className="font-semibold text-gray-300 mb-2">Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-3 opacity-80 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer rounded overflow-hidden hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={url}
                  alt="media"
                  className="w-full h-full rounded-md object-cover"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-2">No media yet</p>
          )}
        </div>
      </div>

      <button
        onClick={logout}
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-500 to-black text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}

export default RightSideBar;
