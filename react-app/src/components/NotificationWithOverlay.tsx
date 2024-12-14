import '../App.scss';

function NotificationWithOverlay(props: { textTop: string, textBottom: string }) {
    return (
        <>
            {(props.textTop !== "") && (props.textBottom !== "") && (
                <div className='notification-overlay'>
                    <div id="notification-progress" className='notification'>
                        <p>{props.textTop}</p>
                        <p>{props.textBottom}</p>
                    </div>
                </div>
            )}
        </>
    )
}

export default NotificationWithOverlay;