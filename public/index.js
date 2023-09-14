let file = null;

const handleSubmit = async (event) => {
  event.preventDefault();
  console.log(file);
  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:5005/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      
      console.log(data.cid);
      console.log(data.transactionHash);
      alert("File uploaded successfully!");
    } else {
  
      console.error("File upload failed with status:", response.status);
      alert("File upload failed.");
    }
  } catch (error) {
    console.error("An error occurred:", error);0
    alert("An error occurred while uploading the file.");
  }
};

function retrieveFile(event) {
  const selectedFile = event.target.files[0];
  file = selectedFile;
  // console.log("Selected File:", selectedFile);
}

const pick1 = document.querySelector(".input1"); 
pick1.addEventListener("change", retrieveFile);

const btn1 = document.querySelector(".btn1"); 
btn1.addEventListener("click", handleSubmit);
