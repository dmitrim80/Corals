import React, { useState, useEffect } from "react";
import { storage, auth } from "./Firebase-config";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";
import imagepath1 from "../assets/images/Acro.jpeg";
import imagepath2 from "../assets/images/Chalice.jpeg";
import imagepath3 from "../assets/images/Monti.jpeg";
import imagepath4 from "../assets/images/Favia.jpeg";
import imagepath5 from "../assets/images/Mushroom.jpeg";
import imagepath6 from "../assets/images/Scoly.jpeg";
import imagepath7 from "../assets/images/Zoas.jpeg";
import imagepath8 from "../assets/images/FishTank.jpeg";
import imagepath9 from "../assets/images/NPSCoral.jpeg";
import imagepath10 from "../assets/images/AquascapeIdeas.jpeg";
import ImageScroll from "./CoralImageScroll";

const CoralHomepage = ({ darkMode }) => {
  const images = [
    { src: imagepath1, label: "acro", route: "acro" },
    { src: imagepath2, label: "chalice", route: "chalice" },
    { src: imagepath3, label: "monti", route: "monti" },
    { src: imagepath4, label: "favia", route: "favia" },
    { src: imagepath5, label: "mushroom", route: "mushroom" },
    { src: imagepath6, label: "scoly", route: "scoly" },
    { src: imagepath7, label: "zoas", route: "zoas" },
    {
      src: imagepath8,
      label: "fishtank",
      route: "fishtank",
    },
    { src: imagepath9, label: "nps", route: "nps" },
    { src: imagepath10, label: "aquascape", route: "aquascape" },
  ];
  const pageClass = darkMode ? "coral-main-page dark-mode" : "coral-main-page";
  const pageClass2 = darkMode
    ? "coral-homepage-images-list dark-mode"
    : "coral-homepage-images-list";

  const navigate = useNavigate();

  const handleImageClick = (route) => {
    navigate(`/corals/${route}`);
  };

  const [visibleImages, setVisibleImages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);

  useEffect(() => {
    loadMoreImages();
  }, []);

  const loadMoreImages = async () => {
    const acroporaRef = ref(storage, "Acropora");
    try {
      const result = await listAll(acroporaRef, {
        maxResults: 5,
        pageToken: nextPageToken,
      });
      const urlPromises = result.items.map((itemRef) =>
        getDownloadURL(itemRef)
      );
      const urls = await Promise.all(urlPromises);
      setVisibleImages((prevImages) => [...prevImages, ...urls]);
      setNextPageToken(result.nextPageToken);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollWidth - e.target.scrollLeft === e.target.clientWidth;
    if (bottom && nextPageToken) {
      loadMoreImages();
    }
  };

  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);

  const imageListRef = ref(storage, "images/");

  const uploadImage = () => {
    if (imageUpload == null) return;

    const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);

    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageList((prev) => [...prev, url]);
      });
    });
  };

  useEffect(() => {
    listAll(imageListRef).then((response) => {
      const fetchURLs = response.items.map((item) => {
        return getDownloadURL(item);
      });
      Promise.all(fetchURLs).then((urls) => {
        setImageList(urls);
      });
    });
  }, [imageListRef]);

  return (
    <>
      {/* <div className="coral-homepage-imagescroll-container">
        <ImageScroll />
      </div> */}

      <div className={pageClass}>
        <div className={pageClass2}>
          {images.map((image, index) => (
            <div
              key={index}
              className="coral-homepage-image-container"
              onClick={() => handleImageClick(image.route)}
            >
              <img src={image.src} className="coral-homepage-img-grid" />
              <span className="coral-home-img-label">{image.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CoralHomepage;
