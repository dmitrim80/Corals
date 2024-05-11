import React, { useState, useEffect } from "react";
import { storage } from "./Firebase-config"; // Adjust this import according to your Firebase configuration file
import { ref, list, getDownloadURL } from "firebase/storage";
import "./corals_page.css";

const ImageScroll = () => {
  const [visibleImages, setVisibleImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // Initially no image is selected

  useEffect(() => {
    // Function to load more images
    const loadMoreImages = async () => {
      const acroporaRef = ref(storage, "Acropora");
      try {
        const result = await list(acroporaRef, {
          maxResults: 7,
        });
        const urls = await Promise.all(
          result.items.map((itemRef) => getDownloadURL(itemRef))
        );
        setVisibleImages((prevImages) => [...prevImages, ...urls]);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    loadMoreImages();
  }, []);

  const openModal = (imageUrl) => {
    console.log("Attempting to open modal with image URL:", imageUrl); // Debug log
    setSelectedImage(imageUrl);
  };

  const closeModal = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the modal container
    setSelectedImage(null);
  };

  useEffect(() => {
    console.log("Selected image updated to:", selectedImage); // Debug to check if the image is set
  }, [selectedImage]);

  return (
    <>
      <div className="coral-imagescroll-container">
        <div
          className="box-scroll-images"
          style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        >
          {visibleImages.map((imageUrl, index) => (
            <div key={index} className="scroll-image-container">
              <img
                src={imageUrl}
                alt={`image_${index}`}
                onClick={() => openModal(imageUrl)}
              />
            </div>
          ))}
        </div>
        {selectedImage && (
          <div className="modal-box" onClick={closeModal}>
            <div className="modal-content">
              <img className="modal-img" src={selectedImage} alt="Modal" />
              <button className="modal-button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageScroll;
