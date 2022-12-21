import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  NftWithToken,
} from "@metaplex-foundation/js";
import * as fs from "fs";

const tokenName = "Yoshiioko";
const description = "A picture of a sexy man";
const symbol = "YOSH";
const sellerFeeBasisPoints = 100;
const imageFile = "adrian_1.png";

async function createNft(
  metaplex: Metaplex,
  uri: string
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create({
    uri: uri,
    name: tokenName,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
    symbol: symbol,
  });

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );

  return nft;
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("PublicKey:", user.publicKey.toBase58());

  // 1. Create a Metaplex instance
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // 2. Upload image to Metaplex
  const buffer = fs.readFileSync("src/" + imageFile);
  const file = toMetaplexFile(buffer, imageFile);
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // 3. Upload the metadata using the image URI to get metadata URI (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: tokenName,
    description: description,
    image: imageUri,
  });
  console.log("metadata uri:", uri);

  // 4. Call function to create NFT
  await createNft(metaplex, uri);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
