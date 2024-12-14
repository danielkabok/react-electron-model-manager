import '../App.scss';

function Notification(props: { textTop: string, textBottom: string }) {
    return (
        <>
            {(props.textTop !== "") && (props.textBottom !== "") && (
                <div id="notification-progress" className='notification'>
                    <p>{props.textTop}</p>
                    <p>{props.textBottom}</p>
                </div>
            )}
        </>
    )
}

export default Notification;