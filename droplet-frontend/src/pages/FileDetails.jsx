import { Link, useParams } from "wouter";
import { useState, useEffect } from "react";

function FileDetails() {
  const { simpleID } = useParams();

  const [fileExtension, setFileExtension] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fieldID, setFieldID] = useState("");
  const [object_url, setObjectUrl] = useState("");

  const getFileDetails = async () => {
    await fetch(
      `https://uln1pianga.execute-api.us-east-2.amazonaws.com/DropletAPI/get-data?id=${simpleID}`,
    ).then(async (res) => {
      const {
        fileExtension,
        simpleID: ID,
        fileName,
        fileSize,
        fieldID,
        object_url,
      } = await res.json().then((res) => res.body.Item);

      setFileExtension(fileExtension);
      setFileName(fileName);
      setFileSize(fileSize);
      setFieldID(fieldID);
      setObjectUrl(object_url);
    });
  };

  useEffect(() => {
    getFileDetails();
  });

  return (
    <div>
      <h1>File Details</h1>
      <p>File Name: {fileName}</p>
      <p>File Extension: {fileExtension}</p>
      <p>File Size: {fileSize}</p>
      <p>Field ID: {fieldID}</p>
      <button
        onClick={() => {
          window.open(object_url);
        }}
      >
        View {fileName}
      </button>
    </div>
  );
}

export default FileDetails;
