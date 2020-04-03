import React from "react";
import "./header.scss";
import { getAccount } from "../../services/Web3Service";
import { shortenAddress } from "../../utils";
import makeBlockie from "ethereum-blockies-base64";

function Header(props) {
  const handleConnect = async () => {
    const address = await getAccount();
    props.setAddress(address);
  };
  const getAddressTemplate = address => {
    if (address) {
      return (
        <div className="address-container">
          <span>{shortenAddress(address)}</span>
          <img
            src={makeBlockie(address)}
            alt="address blockie"
            className="address-blockie"
          />
        </div>
      );
    } else {
      return <div>Connect to Wallet</div>;
    }
  };
  return (
    <div className="header">
      <div className="header-first-container">
        <img
          src="https://gblobscdn.gitbook.com/orgs%2F-LgbH7epoDzyZZsd5KbE%2Favatar.png?generation=1578566725631142&alt=media"
          alt="logo"
          className="app-logo"
        />
        <div className="header-tab-container">
          <div
            className={`header-tab ${
              props.page === "swap" ? "tab-active" : null
            }`}
            onClick={e => props.changePage("swap")}
          >
            Swap
          </div>
          <div
            className={`header-tab ${
              props.page !== "swap" ? "tab-active" : null
            }`}
            onClick={e => props.changePage("home")}
          >
            Pools
          </div>
        </div>
      </div>
      <div
        className={"wallet-container " + (props.address ? "connected" : null)}
        onClick={handleConnect}
      >
        {getAddressTemplate(props.address)}
      </div>
    </div>
  );
}

export default Header;
