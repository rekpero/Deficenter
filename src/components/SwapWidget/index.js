import React from "react";
import "./swap_widget.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  estimateSwapTokens,
  swapTokens,
  getAmountInEth,
} from "../../services/Web3Service";
import Loader from "../Loader";
import TokenList from "../TokenList";

function SwapWidget({
  allPoolTokens,
  userAddress,
  setModalConfig,
  setOpenModal,
}) {
  const [loading, setLoading] = React.useState(true);
  const [fee, setFee] = React.useState(0);

  const [token1Amount, setToken1Amount] = React.useState();
  const [token2Amount, setToken2Amount] = React.useState();
  const [firstTokensUniqueList, setFirstTokensUniqueList] = React.useState([]);
  const [secondTokensUniqueList, setSecondTokensUniqueList] = React.useState(
    []
  );
  const [openFirstTokensList, setOpenFirstTokensList] = React.useState(false);
  const [openSecondTokensList, setOpenSecondTokensList] = React.useState(false);
  const [selectedFirstToken, setSelectedFirstToken] = React.useState({});
  const [selectedSecondToken, setSelectedSecondToken] = React.useState({});
  const [firstTokenLoading, setFirstTokenLoading] = React.useState(false);
  const [secondTokenLoading, setSecondTokenLoading] = React.useState(false);
  const [feesSet, setFeesSet] = React.useState(false);

  const getTokenIcon = (tokenAddress) => {
    try {
      return require(`../../assets/tokens/${tokenAddress}/logo.png`);
    } catch (error) {
      return require(`../../assets/icons/info.png`);
    }
  };

  React.useEffect(() => {
    const getAllTokensList = () => {
      const firstTokensList = allPoolTokens.map(
        (token) => token.connectorTokens[0]
      );
      const secondTokensList = allPoolTokens.map(
        (token) => token.connectorTokens[1]
      );
      const allTokenList = [...firstTokensList, ...secondTokensList];
      let allTokensUniqueList = [];
      allTokenList.forEach((token) => {
        if (
          !allTokensUniqueList
            .map((token) => token.address)
            .includes(token.address)
        ) {
          allTokensUniqueList.push(token);
        }
      });
      allTokensUniqueList = allTokensUniqueList.sort((a, b) => {
        return a.info.symbol
          .toLowerCase()
          .localeCompare(b.info.symbol.toLowerCase());
      });
      setFirstTokensUniqueList(allTokensUniqueList);
      setSecondTokensUniqueList(allTokensUniqueList);
      setSelectedFirstToken(allTokensUniqueList[0]);
      setSelectedSecondToken(allTokensUniqueList[1]);
      setLoading(false);
    };

    if (allPoolTokens.length) {
      getAllTokensList();
    } else {
      if (!loading) {
        setLoading(true);
      }
    }
  }, [allPoolTokens, loading]);

  const changeToken1Amount = async (pValue) => {
    setToken1Amount(pValue);

    if (pValue && pValue !== "0" && pValue.indexOf("-") === -1) {
      setFeesSet(false);
      setSecondTokenLoading(true);
      setToken2Amount(0);
      let estimate = null;
      if (pValue)
        estimate = await estimateSwapTokens(
          selectedFirstToken.address,
          selectedSecondToken.address,
          pValue
        );
      // console.log(estimate);
      if (estimate) {
        const bestEstimate = getAmountInEth(estimate.bestRate);
        const txFee = getAmountInEth(estimate.txfee);
        const secTokenValue = Number.parseFloat(bestEstimate);
        setToken2Amount(secTokenValue);
        setFee(txFee);
        setFeesSet(true);
        setSecondTokenLoading(false);
      }
    } else {
      setToken2Amount(0);
    }
  };

  const changeToken2Amount = async (pValue) => {
    setToken2Amount(pValue);
    if (pValue && pValue !== "0" && pValue.indexOf("-") === -1) {
      setFeesSet(false);
      setFirstTokenLoading(true);
      setToken1Amount(0);
      let estimate = null;
      if (pValue)
        estimate = await estimateSwapTokens(
          selectedSecondToken.address,
          selectedFirstToken.address,
          pValue
        );
      // console.log(estimate);
      if (estimate) {
        const bestEstimate = getAmountInEth(estimate.bestRate);
        const txFee = getAmountInEth(estimate.txfee);
        const secTokenValue = Number.parseFloat(bestEstimate);
        setToken1Amount(secTokenValue);
        setFee(txFee);
        setFeesSet(true);
        setFirstTokenLoading(false);
      }
    } else {
      setToken1Amount(0);
    }
  };

  const toggleFirstTokens = (pFlag) => {
    setOpenFirstTokensList(pFlag);
  };

  const toggleSecondTokens = (pFlag) => {
    setOpenSecondTokensList(pFlag);
  };

  const selectFirstToken = (pToken) => {
    setSelectedFirstToken(pToken);
    setToken1Amount(0);
    setToken2Amount(0);
    toggleFirstTokens(false);
    setFeesSet(false);
  };

  const selectSecondToken = (pToken) => {
    setSelectedSecondToken(pToken);
    setToken1Amount(0);
    setToken2Amount(0);
    toggleSecondTokens(false);
    setFeesSet(false);
  };

  const swapResTokens = async () => {
    let isErr = false;
    try {
      setModalConfig({
        status: "pending",
        title: "Transaction Started",
        message: "Please confirm your transaction to proceed.",
      });
      setOpenModal(true);
      const isEth = selectedFirstToken.info.symbol.toLowerCase() === "eth";
      await swapTokens(
        token1Amount,
        selectedFirstToken.address,
        selectedSecondToken.address,
        isEth,
        userAddress
      );
    } catch (err) {
      isErr = true;
      setModalConfig({
        status: "fail",
        title: "Transaction Failed",
        message: err.message,
      });
      setOpenModal(true);
      setTimeout(() => {
        setOpenModal(false);
      }, 5000);
      console.log(err);
    }
    if (!isErr) {
      setModalConfig({
        status: "success",
        title: "Transaction Success",
        message:
          "Your transaction is successfully completed. Please check you account to see your token balance.",
      });
      setOpenModal(true);
      setTimeout(async () => {
        setOpenModal(false);
        setToken1Amount();
        setToken2Amount();
      }, 5000);
    }
  };

  return (
    <div className="swap-widget">
      {openFirstTokensList ? (
        <TokenList
          openTokensList={openFirstTokensList}
          tokensUniqueList={firstTokensUniqueList}
          toggleTokens={toggleFirstTokens}
          selectToken={selectFirstToken}
          isSmartTokensList={false}
        />
      ) : null}
      {openSecondTokensList ? (
        <TokenList
          openTokensList={openSecondTokensList}
          tokensUniqueList={secondTokensUniqueList}
          toggleTokens={toggleSecondTokens}
          selectToken={selectSecondToken}
          isSmartTokensList={false}
        />
      ) : null}
      {!(openFirstTokensList || openSecondTokensList) ? (
        <div className="widget-main-container">
          <div className="widget-header">
            <h3 className="widget-header-title">Swap Tokens</h3>
          </div>
          {loading ? (
            <Loader loaderType="box" />
          ) : (
            <div>
              <div className="pay-container">
                <div className="pay-label">
                  <label>Deposit</label>
                </div>
                <div className="pay-input-container">
                  <div className="input-container">
                    <input
                      type="number"
                      name="payAmount"
                      id="payAmount"
                      className="pay-input"
                      placeholder="0.0"
                      value={token1Amount || ""}
                      onChange={(e) => changeToken1Amount(e.target.value)}
                      autoFocus
                    />
                    {firstTokenLoading ? (
                      <div className="amount-loader">
                        <Loader loaderType="circle" />
                      </div>
                    ) : null}
                  </div>
                  <div
                    className="pay-currency-container"
                    onClick={(e) => toggleFirstTokens(true)}
                  >
                    <div className="pay-currency">
                      <img
                        src={getTokenIcon(selectedFirstToken.address)}
                        alt="token logo"
                        className="connector-token-logo"
                      />
                      {selectedFirstToken.info.symbol}
                    </div>
                    <div className="pay-currency-dropdown">
                      <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pay-container">
                <div className="pay-label">
                  <label>Get</label>
                </div>
                <div className="pay-input-container">
                  <div className="input-container">
                    <input
                      type="number"
                      name="payAmount"
                      id="payAmount"
                      className="pay-input"
                      placeholder="0.0"
                      value={token2Amount || ""}
                      onChange={(e) => changeToken2Amount(e.target.value)}
                    />
                    {secondTokenLoading ? (
                      <div className="amount-loader">
                        <Loader loaderType="circle" />
                      </div>
                    ) : null}
                  </div>
                  <div
                    className="pay-currency-container"
                    onClick={(e) => toggleSecondTokens(true)}
                  >
                    <div className="pay-currency">
                      <img
                        src={getTokenIcon(selectedSecondToken.address)}
                        alt="token logo"
                        className="connector-token-logo"
                      />
                      {selectedSecondToken.info.symbol}
                    </div>
                    <div className="pay-currency-dropdown">
                      <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                  </div>
                </div>
              </div>
              {feesSet ? (
                <div className="fees-container">
                  Fees: {Number.parseFloat(fee).toFixed(3)}
                </div>
              ) : null}

              <div className="buy-container">
                <button
                  type="button"
                  className="buy-button"
                  onClick={(e) => swapResTokens()}
                  disabled={
                    selectedSecondToken.address === selectedFirstToken.address
                  }
                >
                  Swap
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SwapWidget;
