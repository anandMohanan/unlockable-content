import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Wallet, Chain, Network } from "mintbase";
import axios from "axios";
import { Buy } from "../../components/Buy";
import { MediaCollection } from "../../components/MediaCollection";
export default function SingleCollection() {
  const onBtnClick = () => {};

  const [dat, setDat] = useState();
  const [err, setErr] = useState();
  const router = useRouter();
  const metadata_id = router.query.metadata_id;
  console.log(`metadata: ${metadata_id}`);
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data, error } = await new Wallet().init({
          networkName: Network.testnet,
          chain: Chain.near,
          apiKey: "511a3b51-2ed5-4a27-b165-a27a01eebe0a",
        });
        const { wallet } = data;
        const signerRes = await wallet.signMessage("test-message");

        const res = await axios({
          method: "POST",
          url: `http://localhost:8000/api/collection/${metadata_id}`,
          data: {
            metadata_id,
            signerRes,
          },
        });
        console.log(`res not json: ${res}`);
        console.log(`res: ${res.json()}`);
        setDat(res.json());
      } catch (error) {
        setErr(error);
        console.log(error);
      }
    };
    checkAccess();
  }, [metadata_id]);
  // const data = dat && dat.collection[0] ? dat.collection[0] : "ds";
  // console.log(dat.data.collection.name);

  const buy = err ? (
    <Buy meta={metadata_id} />
  ) : (
    <section class="section section-buy-nft">
      <h1 className="text--h1">Checking Access... Please wait</h1>
    </section>
  );
  console.log(`dat: ${dat}`);
  const ele = dat ? (
    <>
      <header className="header">
        <div className="">
          <img
            src={dat.data.collection[0].nftImage}
            className="collection__nft"
            alt="NFT image"
          />
          {console.log(dat.data.collection[0].files)}
        </div>

        <div className="header__right">
          <h2 className="collection__name ma--bottom">
            {dat.data.collection[0].name}
          </h2>
          <p className="collection__description ma--bottom text-base--1">
            {dat.data.collection[0].description}
          </p>
          <span className="collection__price text--h2">
            {dat.data.collection[0].price} NEAR
          </span>
        </div>
      </header>

      <section className="section section-media">
        <div className="media">
          {dat ? (
            dat.data &&
            dat.data.collection[0].files.map((img) => {
              return <MediaCollection img={img} />;
            })
          ) : (
            <section class="section section-buy-nft">
              <h1 className="text--h1">Sorry, You have to buy the nft.</h1>
            </section>
          )}
        </div>
      </section>
    </>
  ) : (
    buy
  );
  return ele;
}
