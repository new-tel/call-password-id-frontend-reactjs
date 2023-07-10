import {useState} from "react";

function App() {
    const [clientNumber, setClientNumber] = useState('');
    const [confirmationNumber, setConfirmationNumber] = useState('');
    const [qrCodeUri, setQrCodeUri] = useState('');
    const [timer, setTimer] = useState(0);
    const [view, setView] = useState('start');

    // Your Call Password ID backend URL.
    const backendUrl = '';

    const handleSubmit = (event) => {
        event.preventDefault();

        try {
            fetch(`${backendUrl}?action=start`, {
                method: 'POST',
                body: new FormData(event.target),
            })
                .then((response) => response.json())
                .then((data) => {
                    const {clientNumber, confirmationNumber, qrCodeUri} = data;
                    setClientNumber(clientNumber);
                    setConfirmationNumber(confirmationNumber);
                    setQrCodeUri(qrCodeUri);
                    callConfirmationCheck(data);
                })
                .catch(() => {
                    setView('error');
                });
        } catch (error) {
            console.error(error);
        }
    };

    const callConfirmationCheck = (callData) => {
        const {callId} = callData;
        const formData = new FormData();
        formData.append('callId', callId);

        try {
            fetch(`${backendUrl}?action=check`, {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    const {flag, timeout} = data;

                    if (timeout > 0) {
                        setTimer(timeout);

                        if (flag) {
                            setView('confirm');
                        } else {
                            setView('wait');
                            setTimeout(() => callConfirmationCheck(callData), 1000);
                        }
                    } else {
                        setView('expire');
                    }
                });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container" style={{maxWidth: '440px'}}>
            <div className="card mt-4">
                <div className="card-header">Call Password ID example</div>
                <div className="card-body">
                    {view === 'start' ? (
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="phoneNumber" className="form-label">Номер мобильного телефона</label>
                            <input type="tel" id="phoneNumber" name="phoneNumber" className="form-control"
                                   pattern="[1-9]\d{6,14}" placeholder="7xxxxxxxxxx" required autoFocus/>
                            <div className="form-text">
                                Для верификации номера телефона вам будет необходимо совершить звонок с указанного
                                номера.
                            </div>
                            <button type="submit" className="btn btn-primary mt-2">Далее</button>
                        </form>
                    ) : view === 'wait' ? (
                        <div><p>Вам необходимо совершить звонок с указанного номера {clientNumber} на
                            номер <a href={`tel:${confirmationNumber}`}>{confirmationNumber}</a></p>
                            <p className="d-none d-sm-block text-center">
                                <img src={qrCodeUri} width="150" height="150" alt="QR code"/></p>
                            <p className="text-center">Ожидаем вашего звонка в течение <span id="timer">{timer}</span> сек.</p>
                        </div>
                    ) : view === 'confirm' ? (
                        <p className="text-center">Указанный номер телефона {clientNumber} успешно верифицирован.</p>
                    ) : view === 'expire' ? (
                        <p className="text-center">Время ожидания звонка истекло, номер {clientNumber} не
                            верифицирован.</p>
                    ) : view === 'error' ? (
                        <p className="text-center">При обработки запроса произошла ошибка.</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default App;

