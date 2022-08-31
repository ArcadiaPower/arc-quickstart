import JSONPretty from "react-json-pretty";

const resultStyle = {
  width: "50%"
}

const CounterfactualResults = ({ title, results }) => {

  return (
    <div style={resultStyle}>
      <h3>{title}:</h3>
      <JSONPretty stringStyle="white-space: normal" data={results}></JSONPretty>
    </div>
  )
}

export default CounterfactualResults;
