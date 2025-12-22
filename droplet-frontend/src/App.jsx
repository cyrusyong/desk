import "./App.css";
import { useState } from "react";

function App() {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileExtension, setFileExtension] = useState("");

  const [file, setFile] = useState();

  const [friendlyURL, setFriendlyURL] = useState();

  const getMetadata = (event) => {
    const file = event.target.files[0];

    const { name, size, type } = file;

    setFileName(name);
    setFileSize(size);
    setFileExtension(type);

    setFile(file);
  };

  const getUploadLink = async () => {
    const response = await fetch(
      "https://uln1pianga.execute-api.us-east-2.amazonaws.com/DropletAPI/create-upload-url",
      {
        method: "POST",
      },
    );

    const { fieldId: fieldID, uploadUrl: uploadURL } = await response.json();
    return { fieldID, uploadURL };
  };

  const uploadFile = async () => {
    const { fieldID, uploadURL } = await getUploadLink();
    await fetch(uploadURL, {
      method: "PUT",
      body: file,
    })
      .then(
        async () =>
          await fetch(
            "https://uln1pianga.execute-api.us-east-2.amazonaws.com/DropletAPI/store-data",
            {
              method: "POST",
              body: JSON.stringify({
                fieldID: fieldID,
                fileName: fileName,
                fileExtension: fileExtension,
                fileSize: fileSize,
              }),
            },
          )
            .then(async (res) => {
              const { simpleID } = await res.json();
              setFriendlyURL(window.location.origin + "/" + simpleID);
            })
            .catch((err) => {
              console.log(err);
            }),
      )
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div>
        <input type="file" onChange={getMetadata}></input>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            uploadFile();
          }}
        >
          Upload
        </button>

        {friendlyURL ? (
          <a
            onClick={() => {
              console.log("naviagte to file detail page + download");
            }}
          >
            {friendlyURL}
          </a>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default App;
