
import { useState } from "react";
import HighlightTable from "../components/ResultTable";

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<any>(null);

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setResults(data);
  };

  return (
    <div>
      <h1>Upload ORU File</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button onClick={uploadFile}>Upload</button>
      {results && (
        <HighlightTable data={results} />
      )}
    </div>
  );
};

export default Home;
