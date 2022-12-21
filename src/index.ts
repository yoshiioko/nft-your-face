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

const tokenName = "Token Name";
const description = "Description";
const symbol = "SYMBOL";
const sellerFeeBasisPoints = 100;
const imageFile = "adrian_1.png";

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
