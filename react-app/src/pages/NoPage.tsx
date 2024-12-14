import Header from '../components/Header';

function NoPage() {
    return (
        <>
            <Header
                previousPage={'/home'}
            />
            <div className='page-content'>
                <h1 className='page-title'>Page not found!</h1>
            </div>
        </>
    );
}

export default NoPage;
