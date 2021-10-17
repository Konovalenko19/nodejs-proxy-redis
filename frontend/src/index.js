import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ReactJson from 'react-json-view';
import axios from 'axios';
import 'regenerator-runtime/runtime.js';
import prettyBytes from 'pretty-bytes';

import './main.css';

const App = () => {
    const defaultMethod = 'GET';
    const defaultUrl = `http://localhost:${3000}/1`;

    const [isLoading, setLoading] = useState(false);
    const [method, setMethod] = useState(defaultMethod);
    const [url, setUrl] = useState(defaultUrl);
    const [response, setResponse] = useState(null);

    const handleChangeMethod = (event) => {
        setMethod(event.target.value);
    };

    const handleChangeUrl = (event) => {
        setUrl(event.target.value);
    };

    const handleResetForm = () => {
        setMethod(defaultMethod);
        setUrl(defaultUrl);
        setResponse(null);
    };

    const handleSendRequest = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            const startTime = new Date().getTime()
            const res = await axios({ method, url });

            res.time = new Date().getTime() - startTime;

            setResponse(res);
            setLoading(false);
        } catch (err) {
            alert(err);
            setLoading(false);
            handleResetForm();
        }
    };

    return (
        <div className="box">

            <div className="box__header">
                <form className="form" onSubmit={handleSendRequest}>
                    <select value={method} onChange={handleChangeMethod}>
                        <option value="GET">GET</option>
                        <option value="POST" disabled>POST</option>
                        <option value="PUT" disabled>PUT</option>
                        <option value="DELETE" disabled>DELETE</option>
                    </select>
                    <input type="text" placeholder="url" value={url} onChange={handleChangeUrl} />
                    <button type="submit">send</button>
                </form>
            </div>

            {isLoading && (
                <div className="box__content">
                    LOADING...
                </div>
            )}

            {Boolean(response) && !isLoading && (
                <div className="box__content">
                    <div className="response">
                        <h2 className="response__title">Response</h2>
                        <div className="response__data">
                            <div>Status: {response.status}</div>
                            <div>Time: {response.time} ms</div>
                            <div>
                                Size:
                                {' '}
                                {prettyBytes(JSON.stringify(response.data).length + JSON.stringify(response.headers).length)}
                            </div>
                        </div>
                        <div className="response__json-box">
                            <ReactJson src={response.data} />
                        </div>
                    </div>
                </div>
            )}

            {Boolean(response) && !isLoading && (
                <div className="box__footer">
                    <button type="button" onClick={handleResetForm}>reset</button>
                </div>
            )}

        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
