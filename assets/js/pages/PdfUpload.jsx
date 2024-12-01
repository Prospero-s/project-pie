import React, { useState } from "react";
import axios from "axios";

function PdfUploader() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
        alert('Veuillez sélectionner un fichier.');
        return;
    }
    const formData = new FormData();
    formData.append('pdf', file);

    try {
        const response = await axios.post('https://localhost/api/pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setData(response.data);
    } catch (error) {
        console.error('Error uploading PDF:', error);
    }
};


  return (
    <div>
      <h1>Upload and Scrape PDF</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit">Upload PDF</button>
      </form>

      {data && (
        <div>
          <h2>Extracted Text</h2>
          <pre>{data.text}</pre>

          <h2>Images</h2>
          <div>
            {data.images.map((image, index) => (
              <img key={index} src={`http://localhost:443/images/${image}`} alt={`Page ${index + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
