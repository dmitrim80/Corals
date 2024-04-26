import React, { useState, useEffect } from "react";
import { storage, db, auth } from "./CoralFirebase-config";
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
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { v4 } from "uuid";

const Acro = () => {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEdit, setModalEdit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedLastEdited, setSelectedLastEdited] = useState(null);
  const [selectedImageCoralName, setSelectedImageCoralName] = useState("");
  const [descriptions, setDescriptions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [imageDescription, setImageDescription] = useState("");
  const [imageCoralName, setImageCoralName] = useState("");
  const [fileInputValue, setFileInputValue] = useState("");
  const [currentImageId, setCurrentImageId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12; // 12 images per page
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = imageList.slice(indexOfFirstImage, indexOfLastImage);
  const totalImages = imageList.length;
  const totalPages = Math.ceil(totalImages / imagesPerPage);

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
      const docRef = doc(db, "corals", image.id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const imageData = docSnapshot.data();
        console.log("Fetched data for image click:", imageData); // Debugging log
        setSelectedImage(image.url);
        setSelectedDescription(imageData.description);
        setSelectedImageCoralName(imageData.coralName);
        setSelectedLastEdited({
          editedBy: imageData.lastEditedBy,
          lastEdited: imageData.lastEdited.toDate().toLocaleString(),
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
  const handleCoralNameInput = (event) => {
    setImageCoralName(event.target.value);
  };

  const uploadImage = async () => {
    if (!imageUpload) return;

    const imageName = v4(); // Random file name
    const imageRef = ref(storage, `Acropora/${imageName}`);
    const userEmail = currentUser ? currentUser.email || "Unknown" : "Unknown";

    try {
      const snapshot = await uploadBytes(imageRef, imageUpload);
      const url = await getDownloadURL(snapshot.ref);

      // Initialize fields when creating a new document
      const newDocRef = await addDoc(collection(db, "corals"), {
        url,
        imageName,
        description: imageDescription,
        coralName: imageCoralName,
        lastEdited: new Date(), // Use current date
        lastEditedBy: userEmail, // Use current user or 'Unknown'
      });

      setImageList((prevList) => [
        {
          id: newDocRef.id,
          url,
          imageName,
          description: imageDescription,
          coralName: imageCoralName,
          lastEdited: new Date(),
          lastEditedBy: userEmail,
        },
        ...prevList,
      ]);
      // Reset the description input after upload

      setImageDescription("");
      setImageCoralName("");
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
        collection(db, "corals"),
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
    // Ensure the image name does not contain 'Acropora/' prefix
    if (imageName.startsWith("Acropora/")) {
      imageName = imageName.replace("Acropora/", "");
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );
    if (isConfirmed) {
      try {
        const imageRef = ref(storage, `Acropora/${imageName}`);
        await deleteObject(imageRef);

        if (!isOrphan) {
          const docRef = doc(db, "corals", imageId);
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

  const onSaveEdit = async (imageId, description, coralName) => {
    console.log("onSaveEdit params:", { imageId, description, coralName });

    if (!imageId || description === undefined || coralName === undefined) {
      let missingData = "";
      if (!imageId) missingData += "Image ID ";
      if (description === undefined) missingData += "Description ";
      if (coralName === undefined) missingData += "Coral Name ";
      alert(`Cannot save changes: Missing information (${missingData.trim()})`);
      return;
    }

    try {
      const userEmail = currentUser
        ? currentUser.email || "Unknown"
        : "Unknown";
      const docRef = doc(db, "corals", imageId);
      await updateDoc(docRef, {
        description: description,
        coralName: coralName,
        lastEdited: new Date(),
        lastEditedBy: userEmail,
      });

      alert("Changes saved successfully!");

      // Update the image list state
      setImageList((prevList) =>
        prevList.map((image) => {
          if (image.id === imageId) {
            return {
              ...image,
              description: description,
              coralName: coralName,
              lastEditedBy: userEmail,
              lastEdited: new Date(),
            };
          }
          return image;
        })
      );
      try {
        const docRef = doc(db, "corals", imageId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const imageData = docSnapshot.data();
          setSelectedDescription(imageData.description);
          setSelectedImageCoralName(imageData.coralName);
          // Update last edited info if needed
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
    imageCoralName,
    lastEdited,
    onClose,
    onEdit,
  }) => {
    if (!url) return null;

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-image-container">
            <img src={url} alt="Full Size" />
          </div>
          <table className="modal-info-table">
            <tbody>
              <tr>
                <td className="coral-name-cell">
                  <div className="coral-name-label">
                    <b>Coral Name:</b>
                  </div>
                  <div className="coral-name-value">{imageCoralName}</div>
                </td>
                <td className="last-edited-cell">
                  Last Edited: {lastEdited.lastEdited}
                  <br />
                  Edited by: {lastEdited.editedBy}
                </td>
                <td className="modal-buttons-cell">
                  <button onClick={onEdit}>Edit</button>
                  <button onClick={onClose}>Close</button>
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
    imageCoralName,
    lastEdited,
    onClose,
    onSaveEdit,
    imageId,
  }) => {
    const [editableDescription, setEditableDescription] = useState(description);
    const [editableCoralName, setEditableCoralName] = useState(imageCoralName);

    useEffect(() => {
      setEditableDescription(description);
      setEditableCoralName(imageCoralName);
    }, [description, imageCoralName]);

    const handleSave = () => {
      if (!editableDescription || !editableCoralName) {
        alert("Please fill out all fields before saving.");
        return;
      }
      if (!currentImageId) {
        alert("Error: Image ID is missing.");
        return;
      }
      onSaveEdit(currentImageId, editableDescription, editableCoralName);
      onClose();
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-image-container">
            <img src={url} alt="Full Size" />
          </div>
          <table className="modal-info-table">
            <tbody>
              <tr>
                <td className="coral-name-cell">
                  <p>
                    <b>Coral Name:</b>
                  </p>
                  <input
                    type="text"
                    value={editableCoralName}
                    onChange={(e) => setEditableCoralName(e.target.value)}
                    className="modal-edit-coral-name-input"
                  />
                </td>
                <td className="last-edited-cell">
                  Last Edited: {lastEdited.lastEdited}
                  <br />
                  Edited by: {lastEdited.editedBy}
                </td>
                <td className="modal-buttons-cell">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={onClose}>Dismiss</button>
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

  const fetchImages = async () => {
    try {
      const coralsCollection = collection(db, "corals");
      const descriptionDocs = await getDocs(coralsCollection);

      let images = [];
      for (const doc of descriptionDocs.docs) {
        const data = doc.data();
        let lastEditedBy =
          data.lastEditedBy || auth.currentUser.displayName || "Unknown";

        // Check if 'last edited by' field is missing and update the document
        if (!data.lastEditedBy) {
          await updateDoc(doc.ref, { lastEditedBy });
        }

        images.push({
          id: doc.id,
          ...data,
          description: data.description || "",
          lastEdited: data.lastEdited ? data.lastEdited.toDate() : new Date(),
          lastEditedBy, // Use updated lastEditedBy
        });
      }

      // Sort images by last edited timestamp
      images.sort((a, b) => b.lastEdited - a.lastEdited);

      setImageList(images);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth State Changed: ", user);
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleDescriptionChange = (id, newDescription) => {
    setDescriptions((prevDescriptions) => ({
      ...prevDescriptions,
      [id]: newDescription,
    }));
    // If the updated image is the currently selected one, update the selectedDescription
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
      // Use the state for the current user's email, fallback to 'Unknown' if not available
      const userEmail = currentUser
        ? currentUser.email || "Unknown"
        : "Unknown";
      const docRef = doc(db, "corals", id);
      await updateDoc(docRef, {
        description,
        lastEditedBy: userEmail, // Use email instead of displayName
        lastEdited: new Date(),
      });
      alert("Description saved!");

      // Update the state to reflect the change
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
      <div className="page-inputbox">
        <div className="page-input-boxes">
          <input
            type="text"
            id="coralNameInput" // Adding an id attribute
            name="coralName" // Adding a name attribute
            className="coral-name-input"
            placeholder="Coral Name..."
            maxLength="30"
            value={imageCoralName}
            onChange={handleCoralNameInput}
          />
          <textarea
            id="descriptionInput"
            name="description"
            className="description-input"
            placeholder="Enter image description (max 300 characters)"
            maxLength="255"
            rows="4" // Sets the initial visible number of lines
            onChange={handleDescriptionInput}
            value={imageDescription}
          ></textarea>
        </div>
        <div className="page-input-box2">
          <input
            type="file"
            id="imageUpload" // Existing id attribute
            name="imageUpload"
            className="file-box" // Adding a name attribute
            value={fileInputValue}
            onChange={handleFileInputChange}
          />
          <button className="page-btn-upload" onClick={uploadImage}>
            Upload
          </button>
        </div>
      </div>

      <div className="page-images-list">
        {currentImages.map((image, index) => (
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
          onClick={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
          }
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <ImageModal
          url={selectedImage}
          description={selectedDescription}
          imageCoralName={selectedImageCoralName}
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
          imageCoralName={selectedImageCoralName}
          lastEdited={selectedLastEdited}
          onSaveEdit={onSaveEdit}
          onClose={handleDismiss}
        />
      )}
    </div>
  );
};

export default Acro;
