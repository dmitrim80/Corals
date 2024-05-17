import React, { useState, useEffect } from "react";
import { storage, db, auth } from "./Firebase-config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  limit,
  query,
  where,
  getDoc,
  orderBy,
  startAfter,
  endBefore,
} from "firebase/firestore";
import { v4 } from "uuid";

const FishTankFurn = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEdit, setModalEdit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedLastEdited, setSelectedLastEdited] = useState(null);
  const [selectedImageAquascapeType, setSelectedImageAquascapeType] =
    useState("");
  const [descriptions, setDescriptions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [imageDescription, setImageDescription] = useState("");
  const [imageAquascapeType, setImageAquascapeType] = useState("");
  const [fileInputValue, setFileInputValue] = useState("");
  const [currentImageId, setCurrentImageId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage, setImagesPerPage] = useState(4);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisibleDocs, setLastVisibleDocs] = useState([]);

  const handleEdit = () => {
    setModalEdit(true); // Open ModalEdit
    setIsModalOpen(false); // Close ImageModal
  };

  const handleDismiss = () => {
    setModalEdit(false); // Close ModalEdit
    setIsModalOpen(true); // Reopen ImageModal
  };

  const handleImageClick = async (image) => {
    try {
      const docRef = doc(db, "fishtankfurniture", image.id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const imageData = docSnapshot.data();
        console.log("Fetched data for image click:", imageData);

        setSelectedImage(image.url);
        setSelectedDescription(imageData.description);
        setSelectedImageAquascapeType(imageData.coralName);

        let lastEditedDate = "";
        if (
          imageData.lastEdited &&
          imageData.lastEdited.toDate instanceof Function
        ) {
          lastEditedDate = imageData.lastEdited.toDate().toLocaleString();
        }

        setSelectedLastEdited({
          editedBy: imageData.lastEditedBy,
          lastEdited: lastEditedDate,
        });

        setCurrentImageId(image.id);
        setIsModalOpen(true);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const handleDescriptionInput = (event) => {
    setImageDescription(event.target.value);
  };

  const handleAquascapeTypeInput = (event) => {
    setImageAquascapeType(event.target.value);
  };

  const uploadImage = async () => {
    if (!imageUpload) return;

    const imageName = v4(); // Random file name
    const imageRef = ref(storage, `Fish Tank as Furniture/${imageName}`);
    const userEmail = currentUser ? currentUser.email || "Unknown" : "Unknown";

    try {
      const snapshot = await uploadBytes(imageRef, imageUpload);
      const url = await getDownloadURL(snapshot.ref);

      const newDocRef = await addDoc(collection(db, "fishtankfurniture"), {
        url,
        imageName,
        description: imageDescription,
        coralName: imageAquascapeType,
        lastEdited: new Date(),
        lastEditedBy: userEmail,
      });

      setImageList((prevList) => [
        {
          id: newDocRef.id,
          url,
          imageName,
          description: imageDescription,
          coralName: imageAquascapeType,
          lastEdited: new Date(),
          lastEditedBy: userEmail,
        },
        ...prevList,
      ]);

      setImageDescription("");
      setImageAquascapeType("");
      setFileInputValue(""); // Reset file input value
    } catch (error) {
      console.error(
        "Error uploading image or creating Firestore document:",
        error
      );
    }
  };

  const handleFileInputChange = (event) => {
    setImageUpload(event.target.files[0]);
    setFileInputValue(event.target.value); // Update the file input value state
  };

  const getDocumentIdFromImageName = async (imageName) => {
    try {
      const q = query(
        collection(db, "fishtankfurniture"),
        where("imageName", "==", imageName)
      );
      const querySnapshot = await getDocs(q);
      console.log(
        `Documents found for image name '${imageName}':`,
        querySnapshot.docs.length
      );
      querySnapshot.forEach((doc) => console.log(doc.id, doc.data()));

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      } else {
        console.log("No matching document found for image name:", imageName);
        return null;
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      return null;
    }
  };

  const deleteImage = async (imageId, imageName, isOrphan) => {
    console.log("Attempting to delete image with Name:", imageName);
    if (imageName.startsWith("Fish Tank as Furniture/")) {
      imageName = imageName.replace("Fish Tank as Furniture/", "");
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );
    if (isConfirmed) {
      try {
        const imageRef = ref(storage, `Fish Tank as Furniture/${imageName}`);
        await deleteObject(imageRef);

        if (!isOrphan) {
          const docRef = doc(db, "fishtankfurniture", imageId);
          await deleteDoc(docRef);
        }

        setImageList(
          imageList.filter((image) => image.imageName !== imageName)
        );
        alert("Image deleted successfully.");
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image: " + error.message);
      }
    }
  };

  const onSaveEdit = async (imageId, description, aquascapeType) => {
    console.log("onSaveEdit params:", { imageId, description, aquascapeType });

    if (!imageId || description === undefined || aquascapeType === undefined) {
      let missingData = "";
      if (!imageId) missingData += "Image ID ";
      if (description === undefined) missingData += "Description ";
      if (aquascapeType === undefined) missingData += "Aquascape Type ";
      alert(`Cannot save changes: Missing information (${missingData.trim()})`);
      return;
    }

    try {
      const userEmail = currentUser
        ? currentUser.email || "Unknown"
        : "Unknown";
      const docRef = doc(db, "fishtankfurniture", imageId);
      await updateDoc(docRef, {
        description: description,
        coralName: aquascapeType,
        lastEdited: new Date(),
        lastEditedBy: userEmail,
      });

      alert("Changes saved successfully!");

      setImageList((prevList) =>
        prevList.map((image) => {
          if (image.id === imageId) {
            return {
              ...image,
              description: description,
              aquascapeType: aquascapeType,
              lastEditedBy: userEmail,
              lastEdited: new Date(),
            };
          }
          return image;
        })
      );

      try {
        const docRef = doc(db, "fishtankfurniture", imageId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const imageData = docSnapshot.data();
          setSelectedDescription(imageData.description);
          setSelectedImageAquascapeType(imageData.aquascapeType);
        } else {
          console.log("Document not found after update.");
        }
      } catch (error) {
        console.error("Error refetching the updated document:", error);
      }

      setIsModalOpen(true);
      setModalEdit(false);
    } catch (error) {
      console.error("Error saving changes: ", error);
      alert("Failed to save changes: " + error.message);
    }
  };

  const ImageModal = ({
    url,
    description,
    imageAquascapeType,
    lastEdited,
    onClose,
    onEdit,
  }) => {
    if (!url) return null;

    return (
      <div className="modal-box" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-img">
            <img src={url} alt="Full Size" />
          </div>
          <table className="modal-info-table">
            <tbody>
              <tr>
                <td className="coral-name-cell">
                  <div className="coral-name-label">
                    <b>Aquascape Type:</b>
                  </div>
                  <div className="coral-name-value">{imageAquascapeType}</div>
                </td>
                <td className="last-edited-cell">
                  Last Edited: {lastEdited.lastEdited}
                  <br />
                  Edited by: {lastEdited.editedBy}
                </td>
                <td className="modal-buttons-cell">
                  <button className="modal-button" onClick={onEdit}>
                    Edit
                  </button>
                  <button className="modal-button" onClick={onClose}>
                    Close
                  </button>
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="modal-description-cell">
                  <p>{description}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ModalEdit = ({
    url,
    description,
    imageAquascapeType,
    lastEdited,
    onClose,
    onSaveEdit,
    imageId,
  }) => {
    const [editableDescription, setEditableDescription] = useState(description);
    const [editableAquascapeType, setEditableAquascapeType] =
      useState(imageAquascapeType);

    useEffect(() => {
      setEditableDescription(description);
      setEditableAquascapeType(imageAquascapeType);
    }, [description, imageAquascapeType]);

    const handleSave = () => {
      if (!editableDescription || !editableAquascapeType) {
        alert("Please fill out all fields before saving.");
        return;
      }
      if (!currentImageId) {
        alert("Error: Image ID is missing.");
        return;
      }
      onSaveEdit(currentImageId, editableDescription, editableAquascapeType);
      onClose();
    };

    return (
      <div className="modal-box" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-img">
            <img src={url} alt="Full Size" />
          </div>
          <table className="modal-info-table">
            <tbody>
              <tr>
                <td className="coral-name-cell">
                  <p>
                    <b>Aquascape Type:</b>
                  </p>
                  <input
                    type="text"
                    value={editableAquascapeType}
                    onChange={(e) => setEditableAquascapeType(e.target.value)}
                    className="modal-edit-coral-name-input"
                  />
                </td>
                <td className="last-edited-cell">
                  Last Edited: {lastEdited.lastEdited}
                  <br />
                  Edited by: {lastEdited.editedBy}
                </td>
                <td className="modal-buttons-cell">
                  <button className="modal-button" onClick={handleSave}>
                    Save
                  </button>
                  <button className="modal-button" onClick={onClose}>
                    Dismiss
                  </button>
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="modal-description-cell">
                  <textarea
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    className="modal-edit-description-input"
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const fetchTotalCount = async () => {
    try {
      const totalCountDoc = await getDoc(
        doc(db, "collection_count", "fishtankfurniture")
      );
      if (totalCountDoc.exists()) {
        const totalCount = totalCountDoc.data().count;
        console.log("Total count:", totalCount);
        setTotalCount(totalCount);
        setTotalPages(Math.ceil(totalCount / imagesPerPage)); // Calculate total pages
        return totalCount;
      } else {
        console.log("Total count document does not exist.");
        return 0;
      }
    } catch (error) {
      console.error("Error fetching total count:", error);
      return 0;
    }
  };

  const fetchImages = async (pageNumber, imagesPerPage, lastVisible = null) => {
    console.log("Current Page Number:", pageNumber);
    console.log("Current imagesPerPage:", imagesPerPage);

    try {
      const coralsCollection = collection(db, "fishtankfurniture");
      let queryRef;
      let remainingImages = totalCount - (pageNumber - 1) * imagesPerPage;
      const currentImagesPerPage =
        remainingImages < imagesPerPage ? remainingImages : imagesPerPage;

      if (currentImagesPerPage <= 0) {
        return; // No need to fetch if currentImagesPerPage is 0 or less
      }

      if (pageNumber === 1) {
        queryRef = query(
          coralsCollection,
          orderBy("imageName"),
          limit(currentImagesPerPage)
        );
      } else if (lastVisible) {
        queryRef = query(
          coralsCollection,
          orderBy("imageName"),
          startAfter(lastVisible),
          limit(currentImagesPerPage)
        );
      } else {
        console.error("Error fetching images: No last visible document found.");
        return;
      }

      const querySnapshot = await getDocs(queryRef);

      let images = [];
      let lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        let lastEditedBy =
          data.lastEditedBy ||
          (currentUser ? currentUser.email || "Unknown" : "Unknown");

        if (!data.lastEditedBy) {
          updateDoc(doc.ref, { lastEditedBy });
        }

        images.push({
          id: doc.id,
          ...data,
          description: data.description || "",
          lastEdited: data.lastEdited ? data.lastEdited.toDate() : new Date(),
          lastEditedBy,
        });
      });

      if (images.length > 0) {
        console.log("Fetched images:", images);
        setImageList(images);
        setLastVisibleDocs((prev) => {
          const newDocs = [...prev];
          newDocs[pageNumber - 1] = lastVisibleDoc;
          return newDocs;
        });
      } else {
        console.log("No images fetched");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTotalCount();
      await fetchImages(1, imagesPerPage);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (currentPage !== 1) {
      fetchImages(currentPage, imagesPerPage, lastVisibleDocs[currentPage - 2]);
    }
  }, [currentPage]);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleDescriptionChange = (id, newDescription) => {
    setDescriptions((prevDescriptions) => ({
      ...prevDescriptions,
      [id]: newDescription,
    }));
    if (selectedImage && id === selectedImage.id) {
      setSelectedDescription(newDescription);
    }
  };

  const saveDescription = async (id) => {
    const description = descriptions[id];
    if (!id || !description) {
      alert(
        "Cannot save description: No document ID found or description is empty"
      );
      return;
    }

    try {
      const userEmail = currentUser
        ? currentUser.email || "Unknown"
        : "Unknown";
      const docRef = doc(db, "aquascapes", id);
      await updateDoc(docRef, {
        description,
        lastEditedBy: userEmail,
        lastEdited: new Date(),
      });
      alert("Description saved!");

      setImageList((prevList) =>
        prevList.map((image) => {
          if (image.id === id) {
            return {
              ...image,
              description,
              lastEditedBy: userEmail,
              lastEdited: new Date(),
            };
          }
          return image;
        })
      );
    } catch (error) {
      alert("Failed to save description: " + error.message);
    }
  };

  return (
    <div className="page-main-box">
      {isModalOpen && (
        <ImageModal
          url={selectedImage}
          description={selectedDescription}
          imageAquascapeType={selectedImageAquascapeType}
          lastEdited={selectedLastEdited}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEdit}
          imageId={currentImageId}
        />
      )}
      {isModalEdit && (
        <ModalEdit
          url={selectedImage}
          description={selectedDescription}
          imageAquascapeType={selectedImageAquascapeType}
          lastEdited={selectedLastEdited}
          onSaveEdit={onSaveEdit}
          onClose={handleDismiss}
        />
      )}
      <div className="page-images-list">
        {imageList.map((image, index) => (
          <div key={image.imageName} className="page-image-container">
            <img
              src={image.url}
              className="page-img-grid"
              onClick={() => handleImageClick(image)}
            />
            <button
              className="page-btn"
              onClick={() => deleteImage(image.id, image.imageName)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage((prev) => prev - 1);
              fetchImages(
                currentPage - 1,
                imagesPerPage,
                lastVisibleDocs[currentPage - 3]
              );
            }
          }}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage((prev) => prev + 1);
              fetchImages(
                currentPage + 1,
                imagesPerPage,
                lastVisibleDocs[currentPage - 1]
              );
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FishTankFurn;
