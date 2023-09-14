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

    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();

      console.log("data.cid:", data.cid);
      console.log("data.transactionHash:", data.transactionHash);

      const transactionDetails = document.getElementById("transaction");
      const imageContainer = document.getElementById("image-container");

      // Display the image in the "image-container" div
      if (data.cid) {
        let img = document.createElement("img");
        img.src = `https://${data.cid}.ipfs.dweb.link`;
        img.innerHTML = "";
        imageContainer.appendChild(img);
      }

      // Display the transaction details as a link in the "transaction-details" div
      if (data.transactionHash) {
        const transactionLink = document.createElement("a");
        transactionLink.href = `https://mumbai.polygonscan.com/tx/${data.transactionHash}`;
        transactionLink.textContent = "Transaction Details";
        transactionDetails.innerHTML = "";
        transactionDetails.appendChild(transactionLink);
      }

      alert("File uploaded successfully!");
    } else {
      alert("File upload failed.");
    }
  } catch (error) {
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
