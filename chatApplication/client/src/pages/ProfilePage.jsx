import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedImage) return;
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#232445] to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl backdrop-blur-2xl text-gray-300 border border-emerald-600/40 shadow-2xl flex items-center justify-between rounded-2xl overflow-hidden max-sm:flex-col-reverse">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1 bg-white/5 rounded-2xl"
        >
          <h3 className="text-2xl font-semibold text-white mb-2">
            Profile Details
          </h3>

          {/* Upload Image */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="avatar"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                onChange={(e) => setSelectedImage(e.target.files[0])}
                type="file"
                id="avatar"
                accept=".png, .jpg, .jpeg"
                hidden
              />
              <img
                src={previewUrl || assets.avatar_icon}
                alt="Profile"
                className={`w-16 h-16 object-cover border border-emerald-500/40 ${
                  selectedImage ? "rounded-full" : "rounded-lg"
                }`}
              />
              <span className="text-sm text-gray-300 group-hover:text-emerald-400 transition">
                Upload Profile Image
              </span>
            </label>

            {selectedImage && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl(null);
                }}
                className="text-xs text-black hover:text-black underline self-start transition"
              >
                Remove Image
              </button>
            )}
          </div>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name..."
            className="p-2 border border-gray-500 rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
            placeholder="Bio Here...."
            className="p-2 border border-gray-500 rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={5}
          ></textarea>

          <button
            type="submit"
            className="bg-gradient-to-r from-gray-500 to-black text-white py-2 rounded-full text-lg font-medium hover:scale-105 transition-transform shadow-lg"
          >
            Save
          </button>
        </form>

        <div className="flex flex-col items-center justify-center p-6">
          <img
            src={ authUser?.profilePic || assets.logo_big}
            alt="Logo"
            className={`max-w-44 aspect-square rounded-full max-sm:mt-6 ${
              selectedImage ? "rounded-full" : "rounded-lg"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
