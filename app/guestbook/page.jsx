"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage"; // ฟังก์ชันช่วย Crop (สร้างไฟล์ใหม่)
import { readFile } from "../utils/readFile"; // ฟังก์ชันอ่านไฟล์ (สร้างไฟล์ใหม่)
import { storage, db } from "../firebase"; // นำเข้า Firebase Storage และ Firestore
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore"; 

export default function Guestbook() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedArea, setCroppedArea] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // สถานะตำแหน่งของกรอบครอป
  const [zoom, setZoom] = useState(1); // สถานะสำหรับการซูม
  const [isUploading, setIsUploading] = useState(false); // สถานะการอัพโหลด
  const router = useRouter();

  const onCropChange = (newCrop) => {
    setCrop(newCrop); // อัพเดตตำแหน่งของกรอบครอป
  };

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels); // ตั้งค่าผลลัพธ์ของการครอป
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const data = await readFile(file);
      setImageSrc(data);
    }
  };

  const handleCropImage = async () => {
    if (!croppedImage && imageSrc && croppedArea) {
      try {
        const croppedImg = await getCroppedImg(imageSrc, croppedArea); // ส่งค่า croppedArea ไปยังฟังก์ชันครอป
        setCroppedImage(croppedImg); // ตั้งค่าภาพที่ครอปแล้ว
      } catch (err) {
        console.error("Error cropping image:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ถ้ายังไม่ได้ครอปภาพจะทำการครอปให้อัตโนมัติ
    if (!croppedImage) {
      await handleCropImage(); // เรียกฟังก์ชันครอปภาพ
    }

    if (!croppedImage) {
      alert("There was an error cropping the image. Please try again.");
      return;
    }

    setIsUploading(true); // ตั้งสถานะการอัพโหลดเป็น true
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      message: formData.get("message"),
      image: croppedImage, // ส่งรูปที่ครอปแล้ว
    };

    try {
      // อัปโหลดไฟล์ที่ครอปแล้วไปยัง Firebase Storage
      const imageRef = ref(storage, `images/${formData.get("name")}-${Date.now()}`); // ตั้งชื่อไฟล์เป็นชื่อผู้ใช้ + เวลา
      const snapshot = await uploadBytes(imageRef, croppedImage); // อัปโหลดไฟล์ไปยัง Firebase Storage
      const downloadURL = await getDownloadURL(snapshot.ref); // ดึง URL ของไฟล์ที่อัปโหลด

      console.log("Image uploaded. File available at:", downloadURL);

      // บันทึกข้อมูล (รวม URL ของภาพ) ไปยัง Firestore
      const dataWithImageUrl = { ...data, imageUrl: downloadURL };

      await addDoc(collection(db, "wishes"), dataWithImageUrl); // ส่งข้อมูลไปยัง Firestore
      console.log("Data saved to Firestore:", dataWithImageUrl);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false); // ตั้งสถานะการอัพโหลดเป็น false เมื่อเสร็จสิ้น
    }
  };

  const handleGoToGarden = () => {
    router.push("/garden");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fefae0] px-4">
      <h1 className="text-2xl md:text-4xl font-bold text-[#6b705c] mb-6">
        Leave Your Wishes
      </h1>
      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-lg rounded-lg p-6"
        >
          <div className="mb-4">
            <label className="block text-[#6b705c] font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#6b705c] font-medium mb-2">
              Your Message
            </label>
            <textarea
              name="message"
              className="w-full border border-gray-300 rounded-lg p-2"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-[#6b705c] font-medium mb-2">
              Upload Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg p-2"
              onChange={handleFileChange}
            />
          </div>
          {imageSrc && (
            <div className="relative w-full h-64 bg-gray-100 mb-4">
              <Cropper
                image={imageSrc}
                crop={crop} // ส่งค่า crop ให้กับ Cropper
                zoom={zoom} // ควบคุมการซูม
                aspect={1}
                onCropChange={onCropChange} // ฟังก์ชันนี้จะอัพเดตตำแหน่งของกรอบครอป
                onCropComplete={onCropComplete} // ฟังก์ชันนี้จะรับค่า croppedArea
                onZoomChange={setZoom} // ฟังก์ชันนี้จะตั้งค่าการซูม
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#81b29a] text-white font-bold rounded-lg hover:bg-[#6a9984] transition"
            disabled={isUploading} // ปิดปุ่มเมื่อกำลังอัพโหลด
          >
            {isUploading ? "Submitting..." : "Submit"}
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-[#6b705c] mb-4">
            Thank You for Your Wishes!
          </h2>
          <p className="text-[#6b705c] mb-6">
            Your wishes have been successfully submitted.
          </p>
          <button
            onClick={handleGoToGarden}
            className="py-2 px-6 bg-[#81b29a] text-white font-bold rounded-lg hover:bg-[#6a9984] transition"
          >
            Go to Garden
          </button>
        </div>
      )}
    </div>
  );
}