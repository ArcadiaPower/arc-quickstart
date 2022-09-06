import JSONPretty from 'react-json-pretty';

const ErrorMessage = (error) => {

  return (
    <JSONPretty data={error} stringStyle="white-space: normal" className='errorMessage'></JSONPretty>
  )
}

export default ErrorMessage;
