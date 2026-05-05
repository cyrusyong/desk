import { useParams } from "wouter";
import { useState, useEffect } from "react";

function FileDetails() {
  const { simpleID } = useParams();

  const [fileExtension, setFileExtension] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fieldID, setFieldID] = useState("");
  const [object_url, setObjectUrl] = useState("");
  const [shredded, setShredded] = useState(false);

  const getFileDetails = async () => {
    const res = await fetch(
      `https://uln1pianga.execute-api.us-east-2.amazonaws.com/DropletAPI/get-data?id=${simpleID}`,
    );

    if (!res.ok) {
      setShredded(true);
      return;
    }

    const {
      fileExtension,
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
  };

  useEffect(() => {
    getFileDetails();
  }, []);

  if (shredded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d2548",
          fontFamily: "'Press Start 2P', monospace",
          color: "#c8423a",
          textAlign: "center",
          padding: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 14, letterSpacing: 1, marginBottom: 16 }}>
            SHREDDED
          </div>
          <div
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 24,
              color: "#a9d3f5",
            }}
          >
            this file has been shredded and is no longer available
          </div>
        </div>
      </div>
    );
  }

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
