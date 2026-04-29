import React, { useContext, useState } from "react";
import SideBar from "../components/SideBar";
import ChatContainer from "../components/ChatContainer";
import RightSideBar from "../components/RightSideBar";
import { ChatContext } from "../../context/ChatContext";

function HomePage() {
  const {selectedUser} = useContext(ChatContext)

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#0f0f1a]">
      <div
        className={`backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl overflow-hidden h-[90%] w-[95%] sm:w-[80%] grid transition-all duration-300 ease-in-out
          ${
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-[1fr_1.2fr]"
          }`}
      >
    
        <SideBar />
                
        <ChatContainer/>

        {<RightSideBar/>}
      </div>
    </div>
  );
}

export default HomePage;
