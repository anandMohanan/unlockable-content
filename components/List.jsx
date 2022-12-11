import { Wallet, Network, Chain } from "mintbase";
import { useState, useEffect, useRef } from "react";
import { MintbaseNFT } from "./mintBaseNFT";

const List = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [nftList, setNftList] = useState();
  const dataFetchedRef = useRef(false);

  const loadOwnedNFT = async () => {
    try {
      const { data: walletData, error } = await new Wallet().init({
        networkName: Network.testnet,
        chain: Chain.near,
        apiKey: process.env.REACT_APP_MINTBASE_API,
      });

      console.log(process.env.REACT_APP_MINTBASE_API);

      const { wallet } = walletData;

      const { data: details } = await wallet.details();

      if (error) {
        console.log(error);
      }

      async function fetchGraphQL(operationsDoc, operationName, variables) {
        const result = await fetch(
          "https://interop-testnet.hasura.app/v1/graphql",
          {
            method: "POST",
            body: JSON.stringify({
              query: operationsDoc,
              variables: variables,
              operationName: operationName,
            }),
          }
        );
        return result.json();
      }
      const operations = (accountId, contract_id) => {
        return `
        query ownedNFT {
          mb_views_nft_tokens(
            distinct_on: metadata_id
            where: {owner: {_eq: "${accountId}"}, _and: {burned_timestamp: {_is_null: true}}, minter: {_eq: "${accountId}"}, nft_contract_id: {_eq: "${contract_id}"}}
            ) {
            nft_contract_id
            title
            description
            media
            metadata_id
          }
        }
      `;
      };

      const contract_id = "unlockableteststore.mintspace2.testnet"

      const returnedNftList = await fetchGraphQL(
        operations(details.accountId , contract_id),
        "ownedNFT",
        {}
      );

      setNftList(returnedNftList.data.mb_views_nft_tokens);
      console.log(returnedNftList);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    loadOwnedNFT();
  });

  return (
    <div className="main">
      <section className="title text--center">
        <div className="container">
          <h1 className="HIW text--h1">Minted NFTs</h1>
        </div>
      </section>

      {isLoading === true ? (
        <section className="section section-buy-nft">
          <h2 className="text--h2 ma--bottom">Loading...</h2>
        </section>
      ) : (
        <section className="flex">
          {nftList.length === 0 ? (
            <section className="section section-buy-nft">
              <h2 className="text--h2 ma--bottom">No NFT</h2>
            </section>
          ) : (
            nftList.map((nftData, id) => {
              return (
                <MintbaseNFT
                  nft={nftData}
                  buttonName={"List for sale"}
                  route={"list"}
                  key={id}
                />
              );
            })
          )}
        </section>
      )}
    </div>
  );
};

export default List;