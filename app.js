const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const app = express();
const path = require("path");
const FormData = require("form-data");
app.use(cors()); // Enable CORS for all routes

//this is used for displaying static folder
app.use("/public", express.static("public"));

//this is use for displaying views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

//this is used defining multer
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
});

// here we are creating a starton api link
const starton = axios.create({
  baseURL: "https://api.starton.io/v3",
  headers: {
    "x-api-key": "sk_live_e0d7164d-9a68-4a22-be54-4ede74aff4ff",
  },
});

app.post("/upload", cors(), upload.single("file"), async (req, res) => {
  let data = new FormData();
  console.log(req.file);
  const buffer = Buffer.from(req.file.buffer); // Convert to Buffer

  data.append("file", buffer, { filename: req.file.originalname });
  data.append("isSync", "true");

  // this is function used for uploading image on IPFS
  async function uploadImageOnIpfs() {
    const ipfsImg = await starton.post("/ipfs/file", data, {
      headers: {
        ...data.getHeaders(), // Set appropriate headers for form data
      },
    });
    return ipfsImg.data;
  }

  // this function is used for uplaoding meta data
  async function uploadMetadataOnIpfs(imgCid) {
    const metadataJson = {
      name: `A Wonderful NFT`,
      description: `Probably the most awesome NFT ever created !`,
      image: `ipfs://ipfs/${imgCid}`,
    };
    const ipfsMetadata = await starton.post("/ipfs/json", {
      name: "My NFT metadata Json",
      content: metadataJson,
      isSync: true,
    });
    return ipfsMetadata.data;
  }
  // here we are defiing the network
  const SMART_CONTRACT_NETWORK = "polygon-mumbai";
  const SMART_CONTRACT_ADDRESS = "0x09f22b18224Bf623c7a753748c3Ec74357AED923";
  const WALLET_IMPORTED_ON_STARTON =
    "0x83b567D5937D72A4A2dC2AC48059604C1DA03Ef5";

  // this is minting function
  async function mintNFT(receiverAddress, metadataCid) {
    const nft = await starton.post(
      `/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`,
      {
        functionName: "mint",
        signerWallet: WALLET_IMPORTED_ON_STARTON,
        speed: "low",
        params: [receiverAddress, metadataCid],
      }
    );
    return nft.data;
  }
  // this is receiver address
  const RECEIVER_ADDRESS = "0xbfc4a4b5F11B4e520eD888972e8C8dDaed46220D";

  const ipfsImgData = await uploadImageOnIpfs();
  const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
  const nft = await mintNFT(RECEIVER_ADDRESS, ipfsMetadata.cid);
  console.log(nft);
  res.status(200).json({
    transactionHash: nft.transactionHash,
    cid: ipfsImgData.cid,
  });
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.render("index");
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port  ${port}`);
});
